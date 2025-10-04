import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// SUGGESTED: Hybrid Approach - Keep only business-critical denormalized data
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
      allowNull: false,
      comment: "References product ID",
    },

    // ✅ BUSINESS CRITICAL - Keep these denormalized fields
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Product name at time of order (names can change)",
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
      comment: "Price per unit at time of order (prices change frequently)",
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
      comment:
        "Primary product image at time of order (images can change/be removed)",
    },

    // ❌ REMOVE THESE - Get from Product table via JOIN when needed:
    // productDescription - rarely changes, can JOIN
    // category - rarely changes, can JOIN
    // weight - rarely changes, can JOIN
  },
  {
    tableName: "order_products",
    timestamps: false,
    hooks: {
      beforeSave: (orderProduct) => {
        orderProduct.totalPrice =
          orderProduct.quantity * orderProduct.unitPrice;
      },
    },
    indexes: [{ fields: ["orderId"] }, { fields: ["productId"] }],
  }
);

export default OrderProduct;
