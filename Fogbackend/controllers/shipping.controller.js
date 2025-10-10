// Shipment management endpoints for admin
import { Op } from "sequelize";
import { CustomerOrder, User, OrderProduct, Product } from "../models/index.js";

// Get all shipments with pagination and filters
export const getAdminShipments = async (req, res) => {
  try {
    console.log("getAdminShipments called with query:", req.query);

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

    // Enhanced search - include order number in tracking search since it can be used as tracking ID
    if (search) {
      whereClause[Op.or] = [
        { trackingNumber: { [Op.iLike]: `%${search}%` } },
        { orderNumber: { [Op.iLike]: `%${search}%` } }, // Search by order number directly
        { contactEmail: { [Op.iLike]: `%${search}%` } },
        { contactPhone: { [Op.iLike]: `%${search}%` } },
        { shippingFirstName: { [Op.iLike]: `%${search}%` } },
        { shippingLastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Base query for shipment-related orders (simplified for debugging)
    const baseWhere = {
      paymentStatus: "paid", // Only paid orders can be shipped
    };

    // Add status filter only if specifically requested
    // Apply status filter - default to shipped orders
    if (
      status &&
      [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ].includes(status)
    ) {
      baseWhere.status = status;
    } else {
      // Default to shipped orders (most relevant for shipping tracking)
      baseWhere.status = "shipped";
    }

    // Combine base conditions with filters
    const finalWhere = { ...baseWhere, ...whereClause };

    console.log("Final where clause:", JSON.stringify(finalWhere, null, 2));

    // Test basic query first
    const testCount = await CustomerOrder.count();
    console.log("Total orders in database:", testCount);

    // Get orders with applied filters
    const { count, rows: orders } = await CustomerOrder.findAndCountAll({
      where: finalWhere,
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

    // Calculate statistics for all shipping orders (without pagination)
    const allShippingOrders = await CustomerOrder.findAll({
      where: baseWhere,
      attributes: ["status"],
      raw: true,
    });

    const stats = {
      total: allShippingOrders.length,
      readyToShip: allShippingOrders.filter((o) =>
        ["confirmed", "processing"].includes(o.status)
      ).length,
      shipped: allShippingOrders.filter((o) => o.status === "shipped").length,
      delivered: allShippingOrders.filter((o) => o.status === "delivered")
        .length,
      cancelled: allShippingOrders.filter((o) => o.status === "cancelled")
        .length,
    };

    // Transform orders to shipment format (keeping original order status)
    const shipments = orders.map((order) => {
      // Use order status directly since we're managing orders, not separate shipments
      const shipmentStatus = order.status;

      return {
        id: `ship_${order.id}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        order: order,
        status: shipmentStatus,
        trackingNumber: order.trackingNumber || order.orderNumber, // Use orderNumber as tracking if not available
        carrier: order.carrier || null,
        shippedAt: order.shippedAt || null,
        estimatedDelivery: order.estimatedDelivery,
        deliveryNotes: order.notes,
        customerName:
          `${order.shippingFirstName || ""} ${
            order.shippingLastName || ""
          }`.trim() || "N/A",
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        createdAt: order.createdAt,
      };
    });

    res.json({
      success: true,
      data: {
        shipments,
        stats, // Add statistics for frontend
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
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to get shipments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      trackingNumber: order.trackingNumber || order.orderNumber, // Use orderNumber as tracking if not available
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

    // Validate input parameters
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Shipment ID is required",
      });
    }

    // Extract order ID from shipment ID
    const orderId = id.replace("ship_", "");

    // Validate extracted order ID
    if (!orderId || orderId === id) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID format",
      });
    }

    const order = await CustomerOrder.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Update order with shipping information (only update provided fields)
    const updateData = {};
    if (status && status.trim()) updateData.status = status.trim();
    if (trackingNumber && trackingNumber.trim())
      updateData.trackingNumber = trackingNumber.trim();
    if (carrier && carrier.trim()) updateData.carrier = carrier.trim();
    if (estimatedDelivery)
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (deliveryNotes !== undefined) updateData.notes = deliveryNotes; // Allow empty string

    // Set shipping timestamp if status is being updated to shipped
    if (status === "shipped" && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    // Set delivery timestamp if status is being updated to delivered
    if (status === "delivered" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    // Validate status transition
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
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
