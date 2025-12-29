import express from "express";
import connectDB from "./src/config/db.config.js";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(express.json());


//API Endpoints
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
