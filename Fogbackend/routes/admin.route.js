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

  // Product Management (for inventory only)
  getAdminProducts,
  updateProductStock,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,

  // Reports functionality moved to dedicated reports.routes.js
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

// ==================== PRODUCT MANAGEMENT ====================
router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.put("/products/:id/stock", updateProductStock);
router.delete("/products/:id", deleteAdminProduct);

// Reports & Analytics now handled by dedicated reports.routes.js at /api/admin/reports

export default router;
