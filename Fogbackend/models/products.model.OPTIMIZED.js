import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// OPTIMIZED: Standardized weight format and added proper validation
const ProductOptimized = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Product name is required" },
        len: {
          args: [2, 100],
          msg: "Product name must be between 2-100 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Product category like 'Black Tea', 'Green Tea', etc.",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Price must be positive" },
      },
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Original price before discount",
    },
    weight: {
      type: DataTypes.STRING, // ✅ FIXED: Changed from DECIMAL to STRING for consistency
      allowNull: false,
      comment: "Weight with unit (e.g., '100g', '250g')",
      validate: {
        isWeightFormat(value) {
          // Validate format: number + letters (e.g., "100g", "250g", "1kg")
          if (!/^\d+[a-zA-Z]+$/.test(value)) {
            throw new Error(
              'Weight must be in format like "100g", "250g", "1kg"'
            );
          }
        },
      },
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Stock quantity cannot be negative" },
      },
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    imageUrl: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of image URLs",
      validate: {
        isImageArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error("ImageUrl must be an array");
          }
          if (value && value.some((url) => typeof url !== "string")) {
            throw new Error("All image URLs must be strings");
          }
        },
      },
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Rating must be between 0-5" },
        max: { args: [5], msg: "Rating must be between 0-5" },
      },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Review count cannot be negative" },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of product features/tags",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of tags for product filtering",
    },
    brewingInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Country/region of origin",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    indexes: [
      { fields: ["category"] },
      { fields: ["price"] },
      { fields: ["isActive"] },
      { fields: ["rating"] },
      { fields: ["stockQuantity"] }, // ✅ ADDED: For stock queries
      { fields: ["category", "isActive"] }, // ✅ ADDED: Composite index for filtering
      { fields: ["price", "isActive"] }, // ✅ ADDED: For price-based filtering
    ],
  }
);

export default ProductOptimized;
