import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
  verifyToken,
  verifyAdminToken,
  refreshAccessToken,
  socialSuccess,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Local auth
router.post("/signup", registerUser);
router.post("/login", loginUser); // Customer login
router.post("/admin/login", loginAdmin); // Admin login
router.post("/logout", logoutUser);
router.get("/verify", verifyToken); // Customer site verification
router.get("/verify-admin", verifyAdminToken); // Admin site verification
router.post("/refresh", refreshAccessToken);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  socialSuccess
);

// Facebook OAuth
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  socialSuccess
);

export default router;
