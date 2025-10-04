import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// OPTIMIZED: Strategic Denormalization - Keep only business-critical historical data
const OrderProductOptimized = sequelize.define(
  "OrderProduct",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "References customer order ID",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for deleted products
      comment: "References product ID (null if product deleted)",
    },

    // ✅ BUSINESS-CRITICAL HISTORICAL DATA (frequently changes)
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Product name at time of order (names can change)",
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Price per unit at time of order (prices change frequently)",
      validate: {
        min: { args: [0], msg: "Unit price must be positive" },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "Quantity must be at least 1" },
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "quantity * unitPrice",
      validate: {
        min: { args: [0], msg: "Total price must be positive" },
      },
    },
    primaryImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "Primary product image at time of order (single image, not array)",
    },

    // ❌ REMOVED REDUNDANT FIELDS (get via JOIN with Product table when needed):
    // - productDescription: Can JOIN Product table
    // - category: Can JOIN Product table
    // - weight: Can JOIN Product table
    // - imageUrl array: Too much data, keep only primary image
  },
  {
    tableName: "order_products",
    timestamps: false,
    hooks: {
      beforeSave: (orderProduct) => {
        // Automatically calculate total price
        orderProduct.totalPrice =
          orderProduct.quantity * orderProduct.unitPrice;
      },
    },
    indexes: [
      { fields: ["orderId"] },
      { fields: ["productId"] },
      { fields: ["orderId", "productId"] }, // Composite index for common queries
    ],
  }
);

export default OrderProductOptimized;
