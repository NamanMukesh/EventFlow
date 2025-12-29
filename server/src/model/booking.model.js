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
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    },

    paymentId: {
      type: String // Stripe transaction ID
    }
  },
  { timestamps: true }
);

export default Booking = mongoose.model("Booking", bookingSchema);
