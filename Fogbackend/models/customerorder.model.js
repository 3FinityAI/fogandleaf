import { DataTypes, Op } from "sequelize";
import sequelize from "../config/db.js";

const CustomerOrder = sequelize.define(
  "CustomerOrder",
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
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Human-readable order number",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Total amount must be positive" },
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cod", "card", "upi", "wallet"),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
      allowNull: false,
    },
    // Shipping Address
    shippingFirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingLastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingPincode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "India",
    },
    // Contact Information
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: "Contact email must be valid" },
      },
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [10, 15], msg: "Phone number must be 10-15 digits" },
      },
    },
    // Order Notes
    orderNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Tracking Information
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    carrier: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Standard",
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Payment Information
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Admin Notes
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "customer_orders",
    timestamps: true,
    hooks: {
      beforeCreate: async (order) => {
        // Generate sequential order number with format FOG + YYYYMM + 4-digit counter
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const prefix = `FOG${year}${month}`;

        // Find the highest order number for current month
        const latestOrder = await CustomerOrder.findOne({
          where: {
            orderNumber: {
              [Op.like]: `${prefix}%`,
            },
          },
          order: [["orderNumber", "DESC"]],
          raw: true,
        });

        let nextSequence = 1;
        if (latestOrder && latestOrder.orderNumber) {
          // Extract the sequence number from the last order
          const lastSequence = parseInt(latestOrder.orderNumber.slice(-4));
          nextSequence = lastSequence + 1;
        }

        // Generate order number with 4-digit padding
        const sequenceStr = nextSequence.toString().padStart(4, "0");
        order.orderNumber = `${prefix}${sequenceStr}`;
      },
    },
    indexes: [
      { fields: ["userId"] },
      { fields: ["status"] },
      { fields: ["orderNumber"], unique: true },
      { fields: ["paymentStatus"] },
      { fields: ["createdAt"] },
    ],
  }
);

export default CustomerOrder;
