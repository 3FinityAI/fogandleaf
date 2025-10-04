import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false, // Must be logged in to add to cart
      comment: "References user ID from JWT token",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "References product ID",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: { args: [1], msg: "Quantity must be at least 1" },
        max: { args: [50], msg: "Quantity cannot exceed 50" },
      },
    },
    // Store product details for quick access (denormalized for performance)
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Price must be positive" },
      },
    },
    productImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productWeight: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Weight with unit (e.g., '100g', '250g')",
    },
    productCategory: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["productId"] },
      {
        fields: ["userId", "productId"],
        unique: true,
        name: "unique_user_product",
      },
    ],
  }
);

export default Cart;
