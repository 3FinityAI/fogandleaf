import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define(
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
      comment: "Product category",
      validate: {
        isIn: {
          args: [
            [
              "Black Tea",
              "Blended Tea",
              "Green Tea",
              "Herbal Tea",
              "Oolong Tea",
              "White Tea",
            ],
          ],
          msg: "Category must be one of: Black Tea, Blended Tea, Green Tea, Herbal Tea, Oolong Tea, White Tea",
        },
      },
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
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      comment: "Weight in grams (e.g., 100.00)",
      defaultValue: 100,
      validate: {
        min: { args: [0], msg: "Weight must be positive" },
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
    ],
  }
);

export default Product;
