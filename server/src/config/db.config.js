import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/eventflow`);
    
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
