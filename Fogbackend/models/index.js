import User from "./users.model.js";
import Product from "./products.model.js";
import Cart from "./cart.model.js";
import CustomerOrder from "./customerorder.model.js";
import OrderProduct from "./orderproduct.model.js";
import StockMovement from "./stockmovement.model.js";

// User-Order Relations
User.hasMany(CustomerOrder, {
  foreignKey: "userId",
  as: "orders",
  constraints: false,
});

CustomerOrder.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: false,
});

// User-Cart Relations
User.hasMany(Cart, {
  foreignKey: "userId",
  as: "cartItems",
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Product-Cart Relations
Product.hasMany(Cart, {
  foreignKey: "productId",
  as: "cartItems",
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Cart.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Order-OrderProduct Relations
CustomerOrder.hasMany(OrderProduct, {
  foreignKey: "orderId",
  as: "products",
  constraints: false,
});

OrderProduct.belongsTo(CustomerOrder, {
  foreignKey: "orderId",
  as: "order",
  constraints: false,
});

// Product-OrderProduct Relations
Product.hasMany(OrderProduct, {
  foreignKey: "productId",
  as: "orderItems",
  constraints: false,
});

OrderProduct.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  constraints: false,
});

// Stock Movement Relations
Product.hasMany(StockMovement, {
  foreignKey: "productId",
  as: "stockMovements",
  constraints: false,
});

StockMovement.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  constraints: false,
});

User.hasMany(StockMovement, {
  foreignKey: "userId",
  as: "stockMovements",
  constraints: false,
});

StockMovement.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: false,
});

export { User, Product, Cart, CustomerOrder, OrderProduct, StockMovement };
