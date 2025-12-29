import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.config.js";
import "dotenv/config";
import authRoute from "./src/routes/auth.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(express.json());
app.use(cookieParser());

//Auth routes
app.use("/api/auth", authRoute);

//API Endpoints
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
