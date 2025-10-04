import express from "express";
import {
  getOverviewAnalytics,
  getSalesChartData,
  getTopProductsAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getComprehensiveReport,
} from "../controllers/reports.controller.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Main comprehensive report endpoint
router.get("/", getComprehensiveReport);

// Individual analytics endpoints
router.get("/overview", getOverviewAnalytics);
router.get("/sales-chart", getSalesChartData);
router.get("/products", getTopProductsAnalytics);
router.get("/customers", getCustomerAnalytics);
router.get("/inventory", getInventoryAnalytics);

export default router;
