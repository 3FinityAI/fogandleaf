import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  trackOrder,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/track/:trackingId", trackOrder); // Public tracking endpoint
router.get("/:id", protect, getOrderById);

export default router;
