import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.config.js";
import "dotenv/config";
import authRoute from "./src/routes/auth.route.js";
import eventRoute from "./src/routes/event.route.js";
import bookingRoute from "./src/routes/booking.route.js";
import paymentRoute, { stripeWebhook } from "./src/routes/payment.route.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

const allowedOrigins = [
  "http://localhost:5173", // Vite
  process.env.FRONTEND_URL
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/events", eventRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/payment", paymentRoute);

// API Endpoints
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
