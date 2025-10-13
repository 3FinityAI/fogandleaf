import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      email,
      firstname: firstName,
      lastname: lastName,
      password,
      provider: "local",
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || user.provider !== "local") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is a customer (not admin)
    if (user.role === "admin") {
      return res.status(403).json({
        message:
          "Admin users cannot access the customer site. Please use the admin portal.",
      });
    }

    user.lastLogin = new Date();

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token in DB - clear any existing refresh tokens first
    user.refreshToken = refreshToken;
    await user.save();

    console.log("Saved refresh token to database for user:", user.id);
    console.log("Refresh token saved:", refreshToken);

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("Set refresh token cookie:", refreshToken);

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin login (separate endpoint for admin portal)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || user.provider !== "local") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is an admin
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    user.lastLogin = new Date();

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    console.log("Admin login successful for:", user.email);

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Admin login successful",
      user: {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  console.log("Refresh token request received");
  console.log("Refresh token present:", refreshToken ? "Yes" : "No");

  if (!refreshToken) {
    console.log("No refresh token in cookies");
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log("Refresh token decoded successfully for user:", decoded.id);

    const user = await User.findOne({
      where: { id: decoded.id, refreshToken },
    });

    if (!user) {
      console.log("Debugging refresh token mismatch:");
      console.log("Looking for user ID:", decoded.id);
      console.log("With refresh token:", refreshToken);

      // Check if user exists but with different refresh token
      const userExists = await User.findByPk(decoded.id);
      if (userExists) {
        console.log("User exists but refresh token doesn't match");
        console.log("DB refresh token:", userExists.refreshToken);
        console.log("Cookie refresh token:", refreshToken);
        console.log("Tokens match:", userExists.refreshToken === refreshToken);
      } else {
        console.log("User doesn't exist in database");
      }

      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    console.log("User found, generating new access token for:", user.email);

    // Issue new access token
    const newAccessToken = generateAccessToken(user.id);

    // Update cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000,
    });

    console.log("Access token refreshed successfully for user:", user.email);
    return res.json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Clear refresh token from database
    if (refreshToken) {
      const user = await User.findOne({ where: { refreshToken } });
      if (user) {
        user.refreshToken = null;
        await user.save();
        console.log("Cleared refresh token for user:", user.email);
      }
    }

    // Clear cookies with proper options
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err.message);
    // Still clear cookies even if database update fails
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Token verification for customer site (only allows customers)
export const verifyToken = async (req, res) => {
  try {
    const { accessToken } = req.cookies;

    console.log("Customer verify request received");
    console.log("Cookies:", req.cookies);
    console.log("Access token:", accessToken ? "Present" : "Missing");

    if (!accessToken) {
      console.log("No access token in cookies");
      return res.status(401).json({
        success: false,
        message: "No access token provided",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    console.log("Token decoded successfully:", decoded.id);

    // Fetch user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.log("User not found in database:", decoded.id);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is a customer (not admin)
    if (user.role === "admin") {
      console.log("Admin user attempting to access customer site:", user.email);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin users cannot access the customer site.",
      });
    }

    console.log("Customer user verified successfully:", user.email);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};

// Token verification for admin site (only allows admins)
export const verifyAdminToken = async (req, res) => {
  try {
    const { accessToken } = req.cookies;

    console.log("Admin verify request received");
    console.log("Access token:", accessToken ? "Present" : "Missing");

    if (!accessToken) {
      console.log("No access token in cookies");
      return res.status(401).json({
        success: false,
        message: "No access token provided",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    console.log("Token decoded successfully:", decoded.id);

    // Fetch user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.log("User not found in database:", decoded.id);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is an admin
    if (user.role !== "admin") {
      console.log(
        "Non-admin user attempting to access admin site:",
        user.email
      );
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    console.log("Admin user verified successfully:", user.email);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin token verification error:", error);
    res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};

// Social login success handler
export const socialSuccess = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
  } catch (error) {
    console.error("Social login error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
