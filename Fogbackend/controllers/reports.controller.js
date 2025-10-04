import { Op, fn, col, literal } from "sequelize";
import {
  User,
  Product,
  CustomerOrder,
  OrderProduct,
  StockMovement,
} from "../models/index.js";
import sequelize from "../config/db.js";

// Helper function to get date range based on filter
const getDateRange = (dateRange) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (dateRange) {
    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: today,
      };
    case "last7days":
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    case "last30days":
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    case "last90days":
      return {
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    case "thisyear":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1),
      };
    default:
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
  }
};

// Helper function to get comparison period
const getComparisonRange = (dateRange, comparison) => {
  const current = getDateRange(dateRange);
  const duration = current.end - current.start;

  switch (comparison) {
    case "previous":
      return {
        start: new Date(current.start.getTime() - duration),
        end: current.start,
      };
    case "lastyear":
      return {
        start: new Date(current.start.getTime() - 365 * 24 * 60 * 60 * 1000),
        end: new Date(current.end.getTime() - 365 * 24 * 60 * 60 * 1000),
      };
    default:
      return null;
  }
};

// Get overview analytics
export const getOverviewAnalytics = async (req, res) => {
  try {
    const { dateRange = "last30days", comparison = "previous" } = req.query;
    const currentPeriod = getDateRange(dateRange);
    const previousPeriod = getComparisonRange(dateRange, comparison);

    // Current period stats
    const currentStats = await Promise.all([
      // Total Revenue
      CustomerOrder.sum("totalAmount", {
        where: {
          createdAt: {
            [Op.between]: [currentPeriod.start, currentPeriod.end],
          },
          paymentStatus: "paid",
        },
      }),

      // Total Orders
      CustomerOrder.count({
        where: {
          createdAt: {
            [Op.between]: [currentPeriod.start, currentPeriod.end],
          },
        },
      }),

      // New Customers
      User.count({
        where: {
          createdAt: {
            [Op.between]: [currentPeriod.start, currentPeriod.end],
          },
          role: "user",
        },
      }),

      // Average Order Value
      CustomerOrder.findOne({
        attributes: [[fn("AVG", col("totalAmount")), "avgOrderValue"]],
        where: {
          createdAt: {
            [Op.between]: [currentPeriod.start, currentPeriod.end],
          },
          paymentStatus: "paid",
        },
        raw: true,
      }),
    ]);

    // Previous period stats for comparison
    let previousStats = [0, 0, 0, { avgOrderValue: 0 }];
    if (previousPeriod) {
      previousStats = await Promise.all([
        CustomerOrder.sum("totalAmount", {
          where: {
            createdAt: {
              [Op.between]: [previousPeriod.start, previousPeriod.end],
            },
            paymentStatus: "paid",
          },
        }),
        CustomerOrder.count({
          where: {
            createdAt: {
              [Op.between]: [previousPeriod.start, previousPeriod.end],
            },
          },
        }),
        User.count({
          where: {
            createdAt: {
              [Op.between]: [previousPeriod.start, previousPeriod.end],
            },
            role: "user",
          },
        }),
        CustomerOrder.findOne({
          attributes: [[fn("AVG", col("totalAmount")), "avgOrderValue"]],
          where: {
            createdAt: {
              [Op.between]: [previousPeriod.start, previousPeriod.end],
            },
            paymentStatus: "paid",
          },
          raw: true,
        }),
      ]);
    }

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const overview = {
      totalRevenue: currentStats[0] || 0,
      totalOrders: currentStats[1] || 0,
      newCustomers: currentStats[2] || 0,
      avgOrderValue: currentStats[3]?.avgOrderValue || 0,
      revenueChange: calculateChange(
        currentStats[0] || 0,
        previousStats[0] || 0
      ),
      ordersChange: calculateChange(
        currentStats[1] || 0,
        previousStats[1] || 0
      ),
      customersChange: calculateChange(
        currentStats[2] || 0,
        previousStats[2] || 0
      ),
      aovChange: calculateChange(
        currentStats[3]?.avgOrderValue || 0,
        previousStats[3]?.avgOrderValue || 0
      ),
    };

    res.json({ success: true, data: overview });
  } catch (error) {
    console.error("Overview analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overview analytics",
      error: error.message,
    });
  }
};

// Get sales chart data
export const getSalesChartData = async (req, res) => {
  try {
    const { dateRange = "last30days" } = req.query;
    const period = getDateRange(dateRange);

    // Determine grouping based on date range
    let timeFormat;
    let groupInterval;

    switch (dateRange) {
      case "today":
      case "yesterday":
        timeFormat = "%H:00";
        groupInterval = "hour";
        break;
      case "last7days":
        timeFormat = "%Y-%m-%d";
        groupInterval = "day";
        break;
      case "last30days":
      case "last90days":
        timeFormat = "%Y-%m-%d";
        groupInterval = "day";
        break;
      default:
        timeFormat = "%Y-%m";
        groupInterval = "month";
    }

    const salesData = await CustomerOrder.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), timeFormat), "period"],
        [fn("COUNT", col("id")), "orderCount"],
        [fn("SUM", col("totalAmount")), "totalRevenue"],
      ],
      where: {
        createdAt: {
          [Op.between]: [period.start, period.end],
        },
      },
      group: [fn("DATE_FORMAT", col("createdAt"), timeFormat)],
      order: [[fn("DATE_FORMAT", col("createdAt"), timeFormat), "ASC"]],
      raw: true,
    });

    res.json({ success: true, data: salesData });
  } catch (error) {
    console.error("Sales chart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales chart data",
      error: error.message,
    });
  }
};

// Get top products analytics
export const getTopProductsAnalytics = async (req, res) => {
  try {
    const { dateRange = "last30days", limit = 10 } = req.query;
    const period = getDateRange(dateRange);

    const topProducts = await Product.findAll({
      attributes: [
        "id",
        "name",
        "price",
        "stockQuantity",
        "rating",
        "reviewCount",
        [fn("COUNT", col("orderItems.id")), "salesCount"],
        [fn("SUM", col("orderItems.quantity")), "totalQuantitySold"],
        [
          fn("SUM", literal("orderItems.quantity * orderItems.price")),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: OrderProduct,
          as: "orderItems",
          attributes: [],
          include: [
            {
              model: CustomerOrder,
              as: "order",
              attributes: [],
              where: {
                createdAt: {
                  [Op.between]: [period.start, period.end],
                },
                paymentStatus: "paid",
              },
            },
          ],
        },
      ],
      group: ["Product.id"],
      having: literal("salesCount > 0"),
      order: [[literal("salesCount"), "DESC"]],
      limit: parseInt(limit),
      subQuery: false,
    });

    // Get products with low stock (less than 10)
    const lowStockProducts = await Product.findAll({
      where: {
        stockQuantity: {
          [Op.between]: [1, 10],
        },
        isActive: true,
      },
      attributes: ["id", "name", "stockQuantity"],
      order: [["stockQuantity", "ASC"]],
      limit: 10,
    });

    // Get out of stock products
    const outOfStockProducts = await Product.findAll({
      where: {
        stockQuantity: 0,
        isActive: true,
      },
      attributes: ["id", "name", "stockQuantity"],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        topProducts,
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    console.error("Top products analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product analytics",
      error: error.message,
    });
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { dateRange = "last30days" } = req.query;
    const period = getDateRange(dateRange);

    // Top customers by spending
    const topCustomers = await User.findAll({
      attributes: [
        "id",
        "firstname",
        "lastname",
        "email",
        [fn("SUM", col("orders.totalAmount")), "totalSpent"],
        [fn("COUNT", col("orders.id")), "orderCount"],
      ],
      include: [
        {
          model: CustomerOrder,
          as: "orders",
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [period.start, period.end],
            },
            paymentStatus: "paid",
          },
        },
      ],
      where: {
        role: "user",
      },
      group: ["User.id"],
      order: [[literal("totalSpent"), "DESC"]],
      limit: 10,
      subQuery: false,
    });

    // Customer acquisition metrics
    const newCustomers = await User.count({
      where: {
        createdAt: {
          [Op.between]: [period.start, period.end],
        },
        role: "user",
      },
    });

    // Returning customers (customers who made more than one order)
    const returningCustomers = await User.count({
      include: [
        {
          model: CustomerOrder,
          as: "orders",
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [period.start, period.end],
            },
          },
        },
      ],
      group: ["User.id"],
      having: literal("COUNT(orders.id) > 1"),
      subQuery: false,
    });

    // Average order value for the period
    const avgOrderValue = await CustomerOrder.findOne({
      attributes: [[fn("AVG", col("totalAmount")), "avgOrderValue"]],
      where: {
        createdAt: {
          [Op.between]: [period.start, period.end],
        },
        paymentStatus: "paid",
      },
      raw: true,
    });

    // Customer retention rate calculation
    const totalCustomers = await User.count({
      where: { role: "user" },
    });

    const customersWithOrders = await User.count({
      include: [
        {
          model: CustomerOrder,
          as: "orders",
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [period.start, period.end],
            },
          },
        },
      ],
      subQuery: false,
    });

    const retentionRate =
      totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;

    res.json({
      success: true,
      data: {
        topSpenders: topCustomers,
        newCustomers,
        returningCustomers: Array.isArray(returningCustomers)
          ? returningCustomers.length
          : returningCustomers,
        retentionRate,
        avgOrderValue: avgOrderValue?.avgOrderValue || 0,
      },
    });
  } catch (error) {
    console.error("Customer analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer analytics",
      error: error.message,
    });
  }
};

// Get inventory analytics
export const getInventoryAnalytics = async (req, res) => {
  try {
    // Low stock alerts (products with stock < 10)
    const lowStock = await Product.findAll({
      where: {
        stockQuantity: {
          [Op.between]: [1, 10],
        },
        isActive: true,
      },
      attributes: ["id", "name", "stockQuantity", "category"],
      order: [["stockQuantity", "ASC"]],
    });

    // Out of stock products
    const outOfStock = await Product.findAll({
      where: {
        stockQuantity: 0,
        isActive: true,
      },
      attributes: ["id", "name", "stockQuantity", "category"],
    });

    // Stock by category
    const stockByCategory = await Product.findAll({
      attributes: [
        "category",
        [fn("COUNT", col("id")), "productCount"],
        [fn("SUM", col("stockQuantity")), "totalStock"],
        [fn("AVG", col("stockQuantity")), "avgStock"],
      ],
      where: {
        isActive: true,
      },
      group: ["category"],
      order: [["category", "ASC"]],
    });

    // Recent stock movements
    const recentStockMovements = await StockMovement.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["name", "category"],
        },
        {
          model: User,
          as: "user",
          attributes: ["firstname", "lastname"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    res.json({
      success: true,
      data: {
        lowStock,
        outOfStock,
        stockByCategory,
        recentStockMovements,
        alerts: {
          lowStock,
          outOfStock,
        },
      },
    });
  } catch (error) {
    console.error("Inventory analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory analytics",
      error: error.message,
    });
  }
};

// Get comprehensive report data
export const getComprehensiveReport = async (req, res) => {
  try {
    const { dateRange = "last30days", reportType = "overview" } = req.query;

    // Get overview data
    const overviewReq = { query: { dateRange } };
    const overviewRes = { json: (data) => data };
    const overviewData = await new Promise((resolve) => {
      getOverviewAnalytics(overviewReq, {
        json: resolve,
        status: () => ({ json: resolve }),
      });
    });

    // Get sales chart data
    const chartReq = { query: { dateRange } };
    const chartData = await new Promise((resolve) => {
      getSalesChartData(chartReq, {
        json: resolve,
        status: () => ({ json: resolve }),
      });
    });

    // Get product analytics
    const productReq = { query: { dateRange } };
    const productData = await new Promise((resolve) => {
      getTopProductsAnalytics(productReq, {
        json: resolve,
        status: () => ({ json: resolve }),
      });
    });

    // Get customer analytics
    const customerReq = { query: { dateRange } };
    const customerData = await new Promise((resolve) => {
      getCustomerAnalytics(customerReq, {
        json: resolve,
        status: () => ({ json: resolve }),
      });
    });

    // Get inventory analytics
    const inventoryData = await new Promise((resolve) => {
      getInventoryAnalytics(
        {},
        {
          json: resolve,
          status: () => ({ json: resolve }),
        }
      );
    });

    const report = {
      overview: overviewData.data || overviewData,
      charts: {
        salesChart: chartData.data || chartData,
        ordersChart: chartData.data || chartData, // Same data, different visualization
      },
      products: {
        topProducts: (productData.data || productData).topProducts,
      },
      customers: customerData.data || customerData,
      inventory: (inventoryData.data || inventoryData).alerts,
    };

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Comprehensive report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate comprehensive report",
      error: error.message,
    });
  }
};
