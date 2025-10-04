// Shipment management endpoints for admin
import { Op } from "sequelize";
import { CustomerOrder, User, OrderProduct, Product } from "../models/index.js";

// Get all shipments with pagination and filters
export const getAdminShipments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      carrier,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    // Fix: Convert to numbers before calculation
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (carrier) whereClause.carrier = carrier;

    // Date range filter
    if (startDate || endDate) {
      whereClause.shippedAt = {};
      if (startDate) whereClause.shippedAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.shippedAt[Op.lte] = endOfDay;
      }
    }

    // Enhanced search
    if (search) {
      whereClause[Op.or] = [
        { trackingNumber: { [Op.iLike]: `%${search}%` } },
        { "$order.orderNumber$": { [Op.iLike]: `%${search}%` } },
        { "$order.contactEmail$": { [Op.iLike]: `%${search}%` } },
        { "$order.contactPhone$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    // For now, use orders as shipments (in real app, you'd have a separate shipments table)
    const { count, rows: orders } = await CustomerOrder.findAndCountAll({
      where: {
        status: { [Op.in]: ["shipped", "delivered", "in_transit"] }, // Only shipped orders
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstname", "lastname", "email"],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: limitNum,
      offset,
    });

    // Transform orders to shipments
    const shipments = orders.map((order) => ({
      id: `ship_${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      order: order,
      status: order.status === "delivered" ? "delivered" : "in_transit",
      trackingNumber:
        order.trackingNumber ||
        `TRK${order.id}${Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase()}`,
      carrier: order.carrier || "dhl",
      shippedAt: order.shippedAt || order.createdAt,
      estimatedDelivery: order.estimatedDelivery,
      deliveryNotes: order.notes,
      customerName: `${order.shippingFirstName || ""} ${
        order.shippingLastName || ""
      }`.trim(),
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      createdAt: order.createdAt,
    }));

    res.json({
      success: true,
      data: {
        shipments,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          totalShipments: count,
          hasNext: pageNum < Math.ceil(count / limitNum),
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get admin shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get shipments",
    });
  }
};

// Get single shipment details
export const getShipmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract order ID from shipment ID (format: ship_123)
    const orderId = id.replace("ship_", "");

    const order = await CustomerOrder.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstname", "lastname", "email"],
          required: false,
        },
        {
          model: OrderProduct,
          as: "products",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price", "imageUrl"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Mock tracking history
    const trackingHistory = [
      {
        status: "Order Confirmed",
        description:
          "Your order has been confirmed and is being prepared for shipment",
        location: "Warehouse",
        timestamp: order.createdAt,
      },
      {
        status: "Shipped",
        description: "Package has been shipped and is on its way",
        location: "Distribution Center",
        timestamp: order.shippedAt || order.createdAt,
      },
    ];

    if (order.status === "delivered") {
      trackingHistory.push({
        status: "Delivered",
        description: "Package has been successfully delivered",
        location: order.shippingCity,
        timestamp: order.deliveredAt || new Date(),
      });
    }

    const shipmentDetails = {
      id: `ship_${order.id}`,
      orderId: order.id,
      order: order,
      trackingHistory: trackingHistory,
    };

    res.json({
      success: true,
      data: shipmentDetails,
    });
  } catch (error) {
    console.error("Get shipment details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get shipment details",
    });
  }
};

// Update shipment information
export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      trackingNumber,
      carrier,
      estimatedDelivery,
      deliveryNotes,
    } = req.body;

    // Extract order ID from shipment ID
    const orderId = id.replace("ship_", "");

    const order = await CustomerOrder.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Update order with shipping information
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
    if (deliveryNotes) updateData.notes = deliveryNotes;

    // Set shipping timestamp if status is being updated to shipped
    if (status === "shipped" && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    // Set delivery timestamp if status is being updated to delivered
    if (status === "delivered" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: "Shipment updated successfully",
      data: {
        id: `ship_${order.id}`,
        ...updateData,
      },
    });
  } catch (error) {
    console.error("Update shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipment",
    });
  }
};
