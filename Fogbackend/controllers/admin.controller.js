import { Op } from "sequelize";
import sequelize from "../config/db.js";
import { CustomerOrder, OrderProduct, Product, User } from "../models/index.js";

// ==================== DASHBOARD ====================
export const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Basic counts
    const [
      totalProducts,
      totalOrders,
      todayOrders,
      monthlyRevenue,
      yearlyRevenue,
      monthlyOrders,
    ] = await Promise.all([
      Product.count(),
      CustomerOrder.count(),
      CustomerOrder.count({
        where: {
          createdAt: { [Op.gte]: startOfDay },
        },
      }),
      CustomerOrder.sum("totalAmount", {
        where: {
          createdAt: { [Op.gte]: startOfMonth },
          status: { [Op.notIn]: ["cancelled"] },
        },
      }),
      CustomerOrder.sum("totalAmount", {
        where: {
          createdAt: { [Op.gte]: startOfYear },
          status: { [Op.notIn]: ["cancelled"] },
        },
      }),
      CustomerOrder.count({
        where: {
          createdAt: { [Op.gte]: startOfMonth },
        },
      }),
    ]);

    // Recent orders
    const recentOrders = await CustomerOrder.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstname", "lastname", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    // Order status breakdown
    const orderStatuses = await CustomerOrder.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Low stock products
    const lowStockProducts = await Product.findAll({
      where: {
        stockQuantity: { [Op.lte]: 5 },
      },
      order: [["stockQuantity", "ASC"]],
      limit: 10,
    });

    // Pending orders count
    const pendingOrders = await CustomerOrder.count({
      where: { status: "pending" },
    });

    // Out of stock products count
    const outOfStockProducts = await Product.count({
      where: { stockQuantity: 0 },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          todayOrders: todayOrders || 0,
          monthlyOrders: monthlyOrders || 0,
          monthlyRevenue: parseFloat(monthlyRevenue || 0),
          totalRevenue: parseFloat(yearlyRevenue || 0),
          pendingOrders: pendingOrders || 0,
          lowStockProducts: lowStockProducts.length || 0,
          outOfStockProducts: outOfStockProducts || 0,
        },
        recentOrders: recentOrders || [],
        orderStatuses: orderStatuses.map((status) => ({
          status: status.status,
          count: parseInt(status.count),
        })),
        lowStockProducts: lowStockProducts || [],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
    });
  }
};

// ==================== ORDER MANAGEMENT ====================
export const getAdminOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    // Fix: Convert to numbers before calculation
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = endOfDay;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      whereClause.totalAmount = {};
      if (minAmount) whereClause.totalAmount[Op.gte] = parseFloat(minAmount);
      if (maxAmount) whereClause.totalAmount[Op.lte] = parseFloat(maxAmount);
    }

    // Enhanced search - search in order details and customer info
    if (search) {
      whereClause[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${search}%` } },
        { contactEmail: { [Op.iLike]: `%${search}%` } },
        { contactPhone: { [Op.iLike]: `%${search}%` } },
        { shippingFirstName: { [Op.iLike]: `%${search}%` } },
        { shippingLastName: { [Op.iLike]: `%${search}%` } },
        { shippingAddress: { [Op.iLike]: `%${search}%` } },
        { shippingCity: { [Op.iLike]: `%${search}%` } },
        { shippingState: { [Op.iLike]: `%${search}%` } },
        { trackingNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await CustomerOrder.findAndCountAll({
      where: whereClause,
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
          attributes: [
            "id",
            "productName",
            "category",
            "weight",
            "quantity",
            "unitPrice",
            "totalPrice",
            "imageUrl",
          ],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price", "imageUrl"],
            },
          ],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          totalOrders: count,
          hasNext: pageNum < Math.ceil(count / limitNum),
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};

export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await CustomerOrder.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "firstname", "lastname"],
        },
        {
          model: OrderProduct,
          as: "products",
          attributes: [
            "id",
            "productName",
            "category",
            "weight",
            "quantity",
            "unitPrice",
            "totalPrice",
            "imageUrl",
          ],
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
        message: "Order not found",
      });
    }
    console.log(order);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get admin order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, notes } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await CustomerOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updateData = { status };

    // Add shipping information if order is being shipped
    if (status === "shipped") {
      // Use order ID as tracking number if not provided (simple approach)
      updateData.trackingNumber = trackingNumber || order.id;
      updateData.carrier = carrier || "Standard";
      updateData.shippedAt = new Date();
    }

    // Add delivery date if order is delivered
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }

    await order.update(updateData);

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, notes } = req.body;

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await CustomerOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updateData = { paymentStatus };

    if (paymentStatus === "paid") {
      updateData.paidAt = new Date();
      // Use order ID as transaction ID if not provided (simple approach)
      updateData.transactionId = transactionId || order.id;
    }

    if (paymentStatus === "refunded") {
      updateData.refundedAt = new Date();
    }

    if (notes) updateData.paymentNotes = notes;

    await order.update(updateData);

    res.json({
      success: true,
      data: order,
      message: `Payment status updated to ${paymentStatus}`,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

export const deleteAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await CustomerOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only allow deletion of cancelled orders
    if (order.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Only cancelled orders can be deleted",
      });
    }

    await order.destroy();

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};

// ==================== SHIPPING MANAGEMENT ====================
export const getShippingOrders = async (req, res) => {
  try {
    const { status = "processing" } = req.query;

    const orders = await CustomerOrder.findAll({
      where: {
        status: ["processing", "shipped"],
        paymentStatus: "paid",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstname", "lastname", "email"],
        },
        {
          model: OrderProduct,
          as: "products",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "id", "weight"],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get shipping orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get shipping orders",
    });
  }
};

export const bulkUpdateShipping = async (req, res) => {
  try {
    const { orders } = req.body; // Array of {id, trackingNumber, carrier}

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Orders array is required",
      });
    }

    const updatePromises = orders.map(async (orderData) => {
      const { id, trackingNumber, carrier } = orderData;

      if (!trackingNumber) {
        throw new Error(`Tracking number required for order ${id}`);
      }

      return CustomerOrder.update(
        {
          status: "shipped",
          trackingNumber,
          carrier: carrier || "Standard",
          shippedAt: new Date(),
        },
        {
          where: { id },
        }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `${orders.length} orders updated successfully`,
    });
  } catch (error) {
    console.error("Bulk update shipping error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update shipping information",
    });
  }
};

// ==================== PRODUCT MANAGEMENT ====================
export const getAdminProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = "name",
      sortOrder = "ASC",
      stockStatus,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (category) whereClause.category = category;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { id: { [Op.eq]: parseInt(search) || -1 } },
      ];
    }

    if (stockStatus) {
      if (stockStatus === "out_of_stock") {
        whereClause.stockQuantity = 0;
      } else if (stockStatus === "low_stock") {
        whereClause.stockQuantity = { [Op.between]: [1, 5] };
      } else if (stockStatus === "in_stock") {
        whereClause.stockQuantity = { [Op.gt]: 5 };
      }
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get products",
    });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.update({
      stockQuantity,
      inStock: stockQuantity > 0,
    });

    res.json({
      success: true,
      data: product,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("Update product stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

// ==================== REPORTS & ANALYTICS ====================
export const getAdminReports = async (req, res) => {
  try {
    const { period = "last30days" } = req.query;

    let startDate, endDate;
    const today = new Date();

    switch (period) {
      case "today":
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );
        break;
      case "last7days":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case "last30days":
      default:
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case "last90days":
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
    }

    // Order analytics
    const [orderStats, paymentStats, shippingStats] = await Promise.all([
      // Order status breakdown
      CustomerOrder.findAll({
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
        },
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
        ],
        group: ["status"],
        raw: true,
      }),

      // Payment status breakdown
      CustomerOrder.findAll({
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
        },
        attributes: [
          "paymentStatus",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["paymentStatus"],
        raw: true,
      }),

      // Shipping performance
      CustomerOrder.findAll({
        where: {
          status: "delivered",
          createdAt: { [Op.between]: [startDate, endDate] },
        },
        attributes: [
          [
            sequelize.fn(
              "AVG",
              sequelize.literal(
                'EXTRACT(DAYS FROM "deliveredAt" - "shippedAt")'
              )
            ),
            "avgDeliveryDays",
          ],
          [sequelize.fn("COUNT", sequelize.col("id")), "deliveredCount"],
        ],
        raw: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        orderAnalytics: {
          byStatus: orderStats.map((stat) => ({
            status: stat.status,
            count: parseInt(stat.count),
            revenue: parseFloat(stat.revenue || 0),
          })),
          byPayment: paymentStats.map((stat) => ({
            status: stat.paymentStatus,
            count: parseInt(stat.count),
          })),
          shipping: {
            averageDeliveryDays: parseFloat(
              shippingStats[0]?.avgDeliveryDays || 0
            ),
            deliveredCount: parseInt(shippingStats[0]?.deliveredCount || 0),
          },
        },
      },
    });
  } catch (error) {
    console.error("Get admin reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reports",
    });
  }
};

// ==================== EXPORT FUNCTIONALITY ====================
export const exportOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      format = "csv",
    } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${search}%` } },
        { contactEmail: { [Op.iLike]: `%${search}%` } },
        { contactPhone: { [Op.iLike]: `%${search}%` } },
        { shippingFirstName: { [Op.iLike]: `%${search}%` } },
        { shippingLastName: { [Op.iLike]: `%${search}%` } },
        { trackingNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const orders = await CustomerOrder.findAll({
      where: whereClause,
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
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format data for export
    const exportData = orders.map((order) => {
      const products = order.products || [];
      const productNames = products.map((p) => p.product?.name).join("; ");
      const productCount = products.length;

      return {
        orderNumber: order.orderNumber,
        customerName: `${order.shippingFirstName} ${order.shippingLastName}`,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        totalAmount: parseFloat(order.totalAmount).toFixed(2),
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderDate: order.createdAt.toISOString().split("T")[0],
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingZip: order.shippingZip,
        shippingCountry: order.shippingCountry,
        productCount: productCount,
        productNames: productNames,
        trackingNumber: order.trackingNumber || "",
        carrier: order.carrier || "",
        notes: order.notes || "",
      };
    });

    if (format === "json") {
      res.json({
        success: true,
        data: exportData,
        count: exportData.length,
      });
    } else {
      // Generate CSV
      const csvHeaders = [
        "Order Number",
        "Customer Name",
        "Email",
        "Phone",
        "Total Amount (₹)",
        "Status",
        "Payment Status",
        "Order Date",
        "Shipping Address",
        "City",
        "State",
        "ZIP",
        "Country",
        "Product Count",
        "Products",
        "Tracking Number",
        "Carrier",
        "Notes",
      ];

      const csvRows = exportData.map((order) => [
        order.orderNumber,
        order.customerName,
        order.contactEmail,
        order.contactPhone,
        order.totalAmount,
        order.status,
        order.paymentStatus,
        order.orderDate,
        order.shippingAddress,
        order.shippingCity,
        order.shippingState,
        order.shippingZip,
        order.shippingCountry,
        order.productCount,
        `"${order.productNames.replace(/"/g, '""')}"`, // Escape quotes
        order.trackingNumber,
        order.carrier,
        `"${order.notes.replace(/"/g, '""')}"`,
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      const filename = `orders_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(csvContent);
    }
  } catch (error) {
    console.error("Export orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export orders",
    });
  }
};

// ==================== ADMIN PRODUCT MANAGEMENT ====================
export const createAdminProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stockQuantity,
      imageUrl,
      sku,
      status = "active",
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stockQuantity: parseInt(stockQuantity) || 0,
      imageUrl,
      sku,
      status,
    });

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Create admin product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const updateAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.update(updateData);

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update admin product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
