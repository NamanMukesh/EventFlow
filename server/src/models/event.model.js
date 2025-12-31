import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  }
});

const dateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  slots: [slotSchema]
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ["Concert", "Conference", "Workshop", "Sports", "Stand-Up", "Other"],
      required: true
    },

    location: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    dates: [dateSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
