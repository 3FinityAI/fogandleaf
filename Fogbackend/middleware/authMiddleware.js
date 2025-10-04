// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Or check HttpOnly cookie (sent automatically with axios if withCredentials: true)
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Token expired, please refresh"
          : "Not authorized, invalid token",
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
};

// Combined admin authentication middleware
export const adminAuth = [protect, isAdmin];
