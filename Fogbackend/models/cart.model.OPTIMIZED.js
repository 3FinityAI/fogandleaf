import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// OPTIMIZED: Normalized Cart Model
// REMOVED: productName, productPrice, productImage, productWeight, productCategory
// REASON: These can be fetched via JOIN with Product table (rarely change)
const CartOptimized = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
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
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "When item was added to cart (useful for cart cleanup)",
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["productId"] },
      { fields: ["addedAt"] }, // For cart cleanup queries
      {
        fields: ["userId", "productId"],
        unique: true,
        name: "unique_user_product",
      },
    ],
  }
);

export default CartOptimized;
