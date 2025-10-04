import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StockMovement = sequelize.define(
  "StockMovement",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the product",
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Product name at the time of movement",
    },
    movementType: {
      type: DataTypes.ENUM(
        "restock",
        "sale",
        "adjustment",
        "return",
        "transfer",
        "damage",
        "expired"
      ),
      allowNull: false,
      comment: "Type of stock movement",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Quantity moved (positive for inbound, negative for outbound)",
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Stock quantity before the movement",
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Stock quantity after the movement",
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Reason for the stock movement",
    },
    referenceId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Reference ID (order ID, batch ID, etc.)",
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Cost per unit at the time of movement",
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Total cost of the movement",
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Supplier ID for restocks",
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Supplier name at the time of movement",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "User who performed the movement",
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "System",
      comment: "User name at the time of movement",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional notes about the movement",
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Batch number for tracking",
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Expiry date for the batch",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Storage location",
    },
    isAutomated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether the movement was automated (e.g., from order)",
    },
  },
  {
    tableName: "stock_movements",
    timestamps: true,
    indexes: [
      { fields: ["productId"] },
      { fields: ["movementType"] },
      { fields: ["createdAt"] },
      { fields: ["userId"] },
      { fields: ["referenceId"] },
      { fields: ["supplierId"] },
      { fields: ["batchNumber"] },
    ],
  }
);

export default StockMovement;
