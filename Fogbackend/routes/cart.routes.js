import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart operations require authentication for database storage
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove/:productId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

// Merge guest cart with user cart after login
router.post("/merge", protect, mergeGuestCart);

export default router;
