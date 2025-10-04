import { Router } from "express";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import {
  // Dashboard
  getAdminDashboard,

  // Order Management
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteAdminOrder,
  exportOrders,

  // Shipping Management
  getShippingOrders,
  bulkUpdateShipping,

  // Product Management (for inventory only)
  getAdminProducts,
  updateProductStock,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,

  // Reports
  getAdminReports,
} from "../controllers/admin.controller.js";

const router = Router();

// Apply auth middleware to all admin routes
router.use(protect);
router.use(isAdmin);

// ==================== DASHBOARD ====================
router.get("/dashboard", getAdminDashboard);

// ==================== ORDER MANAGEMENT ====================
router.get("/orders", getAdminOrders);
router.get("/orders/export", exportOrders);
router.get("/orders/:id", getAdminOrderById);
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/payment", updatePaymentStatus);
router.delete("/orders/:id", deleteAdminOrder);

// ==================== SHIPPING MANAGEMENT ====================
router.get("/shipping", getShippingOrders);
router.put("/shipping/bulk-update", bulkUpdateShipping);

// ==================== PRODUCT MANAGEMENT ====================
router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.put("/products/:id/stock", updateProductStock);
router.delete("/products/:id", deleteAdminProduct);

// ==================== REPORTS & ANALYTICS ====================
router.get("/reports", getAdminReports);

export default router;
