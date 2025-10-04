import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrderProduct = sequelize.define(
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
      allowNull: true, // Allow null for cart-only items without database product reference
      comment: "References product ID (null for cart-only items)",
    },
    // Store product details at time of order (in case product changes later)
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Weight with unit (e.g., '100g', '250g')",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "Quantity must be at least 1" },
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Price per unit at time of order",
      validate: {
        min: { args: [0], msg: "Unit price must be positive" },
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
    imageUrl: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of product image URLs at time of order",
    },
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
    indexes: [{ fields: ["orderId"] }, { fields: ["productId"] }],
  }
);

export default OrderProduct;
