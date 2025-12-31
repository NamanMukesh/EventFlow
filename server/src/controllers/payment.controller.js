import Stripe from "stripe";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Event from "../models/event.model.js";

// Initialize Stripe - handle missing key gracefully
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY not found. Payment features will be limited.");
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error("Stripe initialization error:", error);
}

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
    }

    if (!stripe) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Payment service not configured. Please set STRIPE_SECRET_KEY in environment variables."
        });
    }

    // Find booking and populate event
    const booking = await Booking.findById(bookingId)
      .populate("event", "title price");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Access denied" });
    }

    // Check if booking is already paid or cancelled
    if (booking.paymentStatus === "paid" || booking.bookingStatus === "cancelled") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Booking is already ${booking.bookingStatus} or ${booking.paymentStatus}`
        });
    }

    // Calculate total amount (price per ticket * number of seats)
    const totalAmount = booking.event.price * booking.seatsBooked;
    const amountInCents = Math.round(totalAmount * 100); // Stripe uses cents

    if (amountInCents < 50) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Amount must be at least $0.50"
        });
    }

    // Create payment intent (without auto-confirm - will be confirmed after card details)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
        eventId: booking.event._id.toString(),
        seatsBooked: booking.seatsBooked.toString()
      },
      description: `Payment for ${booking.event.title} - ${booking.seatsBooked} seat(s)`,
      // Disable redirect-based payment methods (card-only payments)
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never"
      }
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      currency: "usd",
      message: "Payment intent created successfully"
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to create payment intent"
      });
  }
};

// Confirm payment (called after successful payment on frontend)
const confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({
          success: false,
          message: "Booking ID and Payment Intent ID are required"
        });
    }

    if (!stripe) {
      await session.abortTransaction();
      return res
        .status(500)
        .json({
          success: false,
          message: "Payment service not configured"
        });
    }

    // Verify payment intent with Stripe
    // Payment should already be confirmed on frontend using Stripe.js
    // Backend only verifies the status and updates booking
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Only proceed if payment has succeeded (confirmed on frontend)
    if (paymentIntent.status !== "succeeded") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({
          success: false,
          message: `Payment not completed. Status: ${paymentIntent.status}. Please complete payment first.`,
          paymentStatus: paymentIntent.status
        });
    }

    // Verify booking ID matches
    if (paymentIntent.metadata.bookingId !== bookingId) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({
          success: false,
          message: "Payment intent does not match booking"
        });
    }

    // Find and update booking
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Access denied" });
    }

    // Check if booking is still pending
    if (booking.bookingStatus !== "pending") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({
          success: false,
          message: `Booking is already ${booking.bookingStatus}`
        });
    }

    // Update booking status and payment info atomically
    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentId = paymentIntentId;
    await booking.save({ session });

    // Commit transaction
    await session.commitTransaction();

    const populatedBooking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("event", "title location price");

    return res.status(200).json({
      success: true,
      booking: populatedBooking,
      message: "Payment confirmed and booking confirmed successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Confirm payment error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to confirm payment"
      });
  } finally {
    session.endSession();
  }
};

// Stripe webhook handler (for server-side payment confirmation)
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const session = await mongoose.startSession();
  session.startTransaction();

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    await session.abortTransaction();
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;

      if (!bookingId) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Booking ID not found in payment intent metadata"
        });
      }

      // Find and update booking
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        await session.abortTransaction();
        console.error(`Booking ${bookingId} not found`);
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // Only update if booking is still pending
      if (booking.bookingStatus === "pending") {
        booking.bookingStatus = "confirmed";
        booking.paymentStatus = "paid";
        booking.paymentId = paymentIntent.id;
        await booking.save({ session });
      }

      await session.commitTransaction();
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;

      if (bookingId) {
        const booking = await Booking.findById(bookingId).session(session);

        if (booking && booking.bookingStatus === "pending") {
          // Mark payment as failed
          booking.paymentStatus = "failed";
          await booking.save({ session });
        }

        await session.commitTransaction();
      }
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    await session.abortTransaction();
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed"
    });
  } finally {
    session.endSession();
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("event", "title price");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Access denied" });
    }

    let paymentIntent = null;
    if (booking.paymentId) {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentId);
      } catch (error) {
        console.error("Error retrieving payment intent:", error);
      }
    }

    return res.status(200).json({
      success: true,
      booking: {
        id: booking._id,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        amount: booking.event.price * booking.seatsBooked,
        seatsBooked: booking.seatsBooked
      },
      paymentIntent: paymentIntent ? {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      } : null
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to get payment status"
      });
  }
};

export {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getPaymentStatus
};

