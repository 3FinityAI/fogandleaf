import express from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  bulkUpdateProducts,
  updateProductImages,
} from "../controllers/product.controller.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Admin routes (protected)
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

// Additional admin routes
router.patch("/:id/restore", protect, isAdmin, restoreProduct);
router.patch("/:id/images", protect, isAdmin, updateProductImages);
router.patch("/bulk", protect, isAdmin, bulkUpdateProducts);

export default router;
