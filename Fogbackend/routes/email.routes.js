import express from "express";
import { sendEmail } from "../services/email.service.js";

const router = express.Router();

// Test email endpoint (remove in production)
router.post("/test", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide to, subject, and message",
      });
    }

    await sendEmail(to, subject, message, `<p>${message}</p>`);

    res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Email test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

export default router;
