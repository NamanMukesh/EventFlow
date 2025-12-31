import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    eventDate: {
      type: Date,
      required: true
    },

    slotTime: {
      type: String,
      required: true
    },

    seatsBooked: {
      type: Number,
      required: true,
      min: 1
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    },

    paymentId: {
      type: String 
    },

    reminder24hSent: {
      type: Boolean,
      default: false
    },

    reminder1hSent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
