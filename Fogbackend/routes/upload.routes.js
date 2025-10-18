import express from "express";
import multer from "multer";
import {
  upload, // Import the configured upload middleware
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} from "../controllers/upload.controller.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Single image upload - proper middleware chaining
router.post("/image", protect, isAdmin, upload.single("image"), uploadImage);

// Multiple images upload - proper middleware chaining
router.post(
  "/images",
  protect,
  isAdmin,
  upload.array("images", 10),
  uploadMultipleImages
);

// Delete single image
router.delete("/image/:publicId", protect, isAdmin, deleteImage);

// Test routes without auth (remove in production)
router.post("/test/image", upload.single("image"), uploadImage);
router.post("/test/images", upload.array("images", 10), uploadMultipleImages);

// Multer error handling middleware - must be at the end
router.use((err, req, res, next) => {
  // Handle Multer-specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File is too large. Maximum size is 5MB per file.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 10 files allowed.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected field name. Use 'image' for single upload or 'images' for multiple uploads.",
      });
    }

    // Handle other multer errors
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Handle CloudinaryStorage errors (like invalid format)
  if (err && err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // If no error, continue to next middleware
  next();
});

export default router;
