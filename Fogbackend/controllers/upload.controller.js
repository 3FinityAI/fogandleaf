// D:/fogandleaf/Fogbackend/controllers/upload.controller.js

import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// --- Configuration (No changes needed here) ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Fogandleaf", // Consider making this an env variable for flexibility
    allowed_formats: ["jpeg", "png", "jpg", "webp"], // Let Cloudinary handle format validation
    transformation: [
      { width: 800, height: 800, crop: "fill", gravity: "center" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      return `product_${timestamp}_${randomString}`;
    },
  },
});

// --- REFACTORED Multer Configuration ---
// We export the middleware instance directly to be used in routes.
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  // REMOVED: Redundant and slightly buggy fileFilter.
  // The 'allowed_formats' in CloudinaryStorage handles this validation perfectly.
});

// --- REFACTORED: Upload single image using async/await ---
// This function now assumes 'upload.single("image")' has already run as middleware.
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: req.file.path, // URL from Cloudinary
      publicId: req.file.filename, // public_id from Cloudinary
    });
  } catch (error) {
    // This block will not catch multer errors directly, they need to be handled
    // in a separate error-handling middleware (see route example below)
    console.error("Error in uploadImage controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- REFACTORED: Upload multiple images using async/await ---
// This function assumes 'upload.array("images", 10)' has already run.
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    const uploadedImages = req.files.map((file) => ({
      imageUrl: file.path,
      publicId: file.filename,
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Error in uploadMultipleImages controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Delete image from Cloudinary (Already good, no changes needed) ---
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      // This could also be a 404 if the publicId was not found
      res.status(404).json({
        success: false,
        message: "Failed to delete image or image not found",
      });
    }
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during image deletion",
    });
  }
};
