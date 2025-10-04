import User from "./users.model.js";
import ProductOptimized from "./products.model.OPTIMIZED.js";
import CartOptimized from "./cart.model.OPTIMIZED.js";
import CustomerOrder from "./customerorder.model.js";
import OrderProductOptimized from "./orderproduct.model.OPTIMIZED.js";
import StockMovement from "./stockmovement.model.js";

// ✅ IMPROVED: Enable FK constraints for data integrity
// CHANGED: constraints: false → constraints: true

// User-Order Relations
User.hasMany(CustomerOrder, {
  foreignKey: "userId",
  as: "orders",
  constraints: true, // ✅ ENABLED for data integrity
  onDelete: "RESTRICT", // Prevent user deletion with existing orders
  onUpdate: "CASCADE",
});

CustomerOrder.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: true,
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// User-Cart Relations
User.hasMany(CartOptimized, {
  foreignKey: "userId",
  as: "cartItems",
  constraints: true,
  onDelete: "CASCADE", // Delete cart items when user is deleted
  onUpdate: "CASCADE",
});

CartOptimized.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Product-Cart Relations
ProductOptimized.hasMany(CartOptimized, {
  foreignKey: "productId",
  as: "cartItems",
  constraints: true,
  onDelete: "CASCADE", // Remove cart items when product is deleted
  onUpdate: "CASCADE",
});

CartOptimized.belongsTo(ProductOptimized, {
  foreignKey: "productId",
  as: "product",
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Order-OrderProduct Relations
CustomerOrder.hasMany(OrderProductOptimized, {
  foreignKey: "orderId",
  as: "products",
  constraints: true,
  onDelete: "CASCADE", // Delete order products when order is deleted
  onUpdate: "CASCADE",
});

OrderProductOptimized.belongsTo(CustomerOrder, {
  foreignKey: "orderId",
  as: "order",
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Product-OrderProduct Relations
ProductOptimized.hasMany(OrderProductOptimized, {
  foreignKey: "productId",
  as: "orderItems",
  constraints: true,
  onDelete: "SET NULL", // ✅ IMPORTANT: Keep order history even if product is deleted
  onUpdate: "CASCADE",
});

OrderProductOptimized.belongsTo(ProductOptimized, {
  foreignKey: "productId",
  as: "product",
  constraints: true,
  onDelete: "SET NULL", // Allow product deletion, preserve order history
  onUpdate: "CASCADE",
});

// Stock Movement Relations
ProductOptimized.hasMany(StockMovement, {
  foreignKey: "productId",
  as: "stockMovements",
  constraints: true,
  onDelete: "RESTRICT", // Prevent product deletion with stock movements
  onUpdate: "CASCADE",
});

StockMovement.belongsTo(ProductOptimized, {
  foreignKey: "productId",
  as: "product",
  constraints: true,
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

User.hasMany(StockMovement, {
  foreignKey: "userId",
  as: "stockMovements",
  constraints: true,
  onDelete: "SET NULL", // Keep stock movements even if user is deleted
  onUpdate: "CASCADE",
});

StockMovement.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: true,
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

export {
  User,
  ProductOptimized as Product,
  CartOptimized as Cart,
  CustomerOrder,
  OrderProductOptimized as OrderProduct,
  StockMovement,
};
