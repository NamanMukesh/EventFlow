import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, User not found" });
    }

    req.user = user;
    next();
    console.log("User authenticated successfully");
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden, Admin access required" });
  }
  next();
};

export { authenticate, isAdmin };