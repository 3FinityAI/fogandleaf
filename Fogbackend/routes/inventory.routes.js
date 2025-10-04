import express from "express";
import {
  getInventoryOverview,
  updateProductStock,
  bulkUpdateStock,
  getStockHistory,
  setReorderPoints,
  generateInventoryReport,
} from "../controllers/inventory.controller.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(isAdmin); // Only admin users can access inventory management

/**
 * @route GET /api/inventory/overview
 * @desc Get inventory overview with statistics and alerts
 * @access Admin
 */
router.get("/overview", getInventoryOverview);

/**
 * @route PUT /api/inventory/stock/:productId
 * @desc Update stock for a specific product
 * @access Admin
 */
router.put("/stock/:productId", updateProductStock);

/**
 * @route PUT /api/inventory/stock/bulk
 * @desc Bulk update stock for multiple products
 * @access Admin
 */
router.put("/stock/bulk", bulkUpdateStock);

/**
 * @route GET /api/inventory/history
 * @desc Get stock movement history
 * @access Admin
 * @query {number} productId - Filter by product ID
 * @query {number} limit - Limit results (default: 50)
 * @query {number} offset - Offset for pagination (default: 0)
 * @query {string} startDate - Filter from date (YYYY-MM-DD)
 * @query {string} endDate - Filter to date (YYYY-MM-DD)
 * @query {string} type - Filter by movement type (restock, sale, adjustment)
 */
router.get("/history", getStockHistory);

/**
 * @route PUT /api/inventory/reorder-points
 * @desc Set reorder points for products
 * @access Admin
 */
router.put("/reorder-points", setReorderPoints);

/**
 * @route GET /api/inventory/report
 * @desc Generate inventory report
 * @access Admin
 * @query {string} format - Report format (json, csv) default: json
 * @query {boolean} includeHistory - Include movement history default: false
 */
router.get("/report", generateInventoryReport);

export default router;
