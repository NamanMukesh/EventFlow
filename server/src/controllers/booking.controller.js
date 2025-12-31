import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Event from "../models/event.model.js";
import { sendCancellationEmail, sendPaymentConfirmationEmail } from "../utils/email.service.js";

// Create booking
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, eventDate, slotTime, seatsBooked } = req.body;

    if (!eventId || !eventDate || !slotTime || !seatsBooked) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (seatsBooked < 1) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "At least 1 seat must be booked" });
    }

    const bookingDate = new Date(eventDate);
    const dateString = bookingDate.toISOString().split("T")[0];

    // Finding event and locking it for update
    const event = await Event.findById(eventId).session(session);

    if (!event) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Finding the date entry
    const dateEntry = event.dates.find(
      (d) => d.date.toISOString().split("T")[0] === dateString
    );

    if (!dateEntry) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Date not available for this event" });
    }

    // Finding the slot
    const slot = dateEntry.slots.find((s) => s.time === slotTime);

    if (!slot) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Time slot not available" });
    }

    // Checking availability
    if (slot.availableSeats < seatsBooked) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({
          success: false,
          message: `Only ${slot.availableSeats} seats available`,
          availableSeats: slot.availableSeats
        });
    }

    // Decrementing available seats atomically
    slot.availableSeats -= seatsBooked;
    await event.save({ session });

    // Creating booking with pending status
    const booking = await Booking.create([{
      user: req.user._id,
      event: eventId,
      eventDate: bookingDate,
      slotTime,
      seatsBooked,
      paymentStatus: "pending",
      bookingStatus: "pending"
    }], { session });

    // Committing transaction
    await session.commitTransaction();

    const populatedBooking = await Booking.findById(booking[0]._id)
      .populate("user", "name email")
      .populate("event", "title location price");

    return res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: "Booking created successfully. Please proceed to payment."
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Getting user's bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title location price category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Getting single booking
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user", "name email")
      .populate("event", "title location price category description");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Checking if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Access denied" });
    }

    return res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// Cancelling booking
const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Checking if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Access denied" });
    }

    if (booking.bookingStatus === "cancelled") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Booking is already cancelled" });
    }

    // Updating booking status atomically
    // If booking was pending, mark payment as failed
    if (booking.bookingStatus === "pending") {
      booking.paymentStatus = "failed";
    }
    
    booking.bookingStatus = "cancelled";
    await booking.save({ session });

    // Refunding seats to event availability
    const event = await Event.findById(booking.event).session(session);
    
    if (event) {
      const bookingDate = new Date(booking.eventDate);
      const dateString = bookingDate.toISOString().split("T")[0];
      
      const dateEntry = event.dates.find(
        (d) => d.date.toISOString().split("T")[0] === dateString
      );

      if (dateEntry) {
        const slot = dateEntry.slots.find((s) => s.time === booking.slotTime);
        if (slot) {
          slot.availableSeats += booking.seatsBooked;
          await event.save({ session });
        }
      }
    }

    // Committing transaction
    await session.commitTransaction();

    // Sending cancellation email
    const populatedBooking = await Booking.findById(id)
      .populate("user", "name email")
      .populate("event", "title location price");
    
    if (populatedBooking) {
      sendCancellationEmail(
        populatedBooking,
        populatedBooking.user,
        populatedBooking.event
      ).catch((error) => {
        console.error("Failed to send cancellation email:", error);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Confirming booking after payment success
const confirmBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { paymentId } = req.body;

    if (!paymentId) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Payment ID is required" });
    }

    const booking = await Booking.findById(id).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Checking if booking is in pending status
    if (booking.bookingStatus !== "pending") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ 
          success: false, 
          message: `Booking is already ${booking.bookingStatus}` 
        });
    }

    // Updating booking status and payment info atomically
    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentId = paymentId;
    await booking.save({ session });

    // Committing transaction
    await session.commitTransaction();

    const populatedBooking = await Booking.findById(id)
      .populate("user", "name email")
      .populate("event", "title location price");

    // Sending payment confirmation email
    sendPaymentConfirmationEmail(
      populatedBooking,
      populatedBooking.user,
      populatedBooking.event
    ).catch((error) => {
      console.error("Failed to send payment confirmation email:", error);
    });

    return res.status(200).json({
      success: true,
      booking: populatedBooking,
      message: "Booking confirmed successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Confirm booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Getting all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("event", "title location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

export {
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    confirmBooking,
    getAllBookings
}