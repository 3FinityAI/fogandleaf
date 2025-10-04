import express from "express";
import {
  getAdminShipments,
  getShipmentDetails,
  updateShipment,
} from "../controllers/shipping.controller.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All shipping routes require admin authentication
router.use(adminAuth);

// Get all shipments with pagination and filters
router.get("/", getAdminShipments);

// Get single shipment details
router.get("/:id", getShipmentDetails);

// Update shipment information
router.put("/:id", updateShipment);

export default router;
