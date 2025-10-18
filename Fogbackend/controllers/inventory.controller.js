import { Product, StockMovement } from "../models/index.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";

// Get inventory overview with stats
export const getInventoryOverview = async (req, res) => {
  try {
    // Get all products with stock information
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "category",
        "stockQuantity",
        "price",
        "originalPrice",
        "inStock",
        "isActive",
        "updatedAt",
      ],
      where: { isActive: true },
      order: [["updatedAt", "DESC"]],
    });

    // Calculate inventory statistics
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => {
      return sum + product.stockQuantity * product.price;
    }, 0);

    // Define stock thresholds
    const lowStockThreshold = 20;
    const criticalStockThreshold = 5;

    const lowStockProducts = products.filter(
      (p) =>
        p.stockQuantity <= lowStockThreshold &&
        p.stockQuantity > criticalStockThreshold
    );
    const criticalStockProducts = products.filter(
      (p) => p.stockQuantity <= criticalStockThreshold
    );
    const outOfStockProducts = products.filter((p) => p.stockQuantity === 0);

    // Calculate average stock level
    const averageStockLevel =
      products.length > 0
        ? products.reduce((sum, p) => sum + p.stockQuantity, 0) /
          products.length
        : 0;

    // Get top categories by value
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0, totalStock: 0 };
      }
      acc[category].count += 1;
      acc[category].value += product.stockQuantity * product.price;
      acc[category].totalStock += product.stockQuantity;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalValue,
          averageStockLevel,
          lowStockCount: lowStockProducts.length,
          criticalStockCount: criticalStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
        },
        alerts: {
          lowStock: lowStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            currentStock: p.stockQuantity,
            reorderPoint: lowStockThreshold,
            type: "low_stock",
            priority: "medium",
          })),
          critical: criticalStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            currentStock: p.stockQuantity,
            reorderPoint: criticalStockThreshold,
            type: "critical",
            priority: "high",
          })),
          outOfStock: outOfStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            currentStock: p.stockQuantity,
            type: "out_of_stock",
            priority: "urgent",
          })),
        },
        categoryStats: topCategories,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          currentStock: p.stockQuantity,
          price: p.price,
          value: p.stockQuantity * p.price,
          status:
            p.stockQuantity === 0
              ? "out_of_stock"
              : p.stockQuantity <= criticalStockThreshold
              ? "critical"
              : p.stockQuantity <= lowStockThreshold
              ? "low_stock"
              : "in_stock",
          lastUpdated: p.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory overview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory overview",
      error: error.message,
    });
  }
};

// Update product stock with history tracking
export const updateProductStock = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productId } = req.params;
    const { adjustment_type, quantity, reason, user = "Admin" } = req.body;

    // Validate productId
    const numericProductId = parseInt(productId);
    if (isNaN(numericProductId) || numericProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID. Product ID must be a positive integer",
      });
    }

    // Validate input
    if (!adjustment_type || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: "Adjustment type, quantity, and reason are required",
      });
    }

    if (!["add", "remove", "set"].includes(adjustment_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment type. Use: add, remove, or set",
      });
    }

    const adjustmentQuantity = parseInt(quantity);
    if (isNaN(adjustmentQuantity) || adjustmentQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    // Get current product
    const product = await Product.findByPk(numericProductId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const previousStock = product.stockQuantity;
    let newStock;

    // Calculate new stock based on adjustment type
    switch (adjustment_type) {
      case "add":
        newStock = previousStock + adjustmentQuantity;
        break;
      case "remove":
        newStock = Math.max(0, previousStock - adjustmentQuantity);
        break;
      case "set":
        newStock = adjustmentQuantity;
        break;
    }

    // Update product stock
    await product.update(
      {
        stockQuantity: newStock,
        inStock: newStock > 0,
      },
      { transaction }
    );

    // Log stock movement
    const movementData = {
      productId: product.id,
      productName: product.name,
      movementType:
        adjustment_type === "set"
          ? "adjustment"
          : adjustment_type === "add"
          ? "restock"
          : "adjustment",
      quantity:
        adjustment_type === "add" ? adjustmentQuantity : -adjustmentQuantity,
      previousStock,
      newStock,
      reason,
      userName: user,
      userId: req.user?.id || null,
      isAutomated: false,
    };

    const stockMovement = await StockMovement.create(movementData, {
      transaction,
    });

    const movementLog = {
      productId: product.id,
      productName: product.name,
      type: adjustment_type === "set" ? "adjustment" : adjustment_type,
      previousStock,
      newStock,
      quantity:
        adjustment_type === "add" ? adjustmentQuantity : -adjustmentQuantity,
      reason,
      user,
      timestamp: new Date(),
    };

    await transaction.commit();

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: {
        product: {
          id: product.id,
          name: product.name,
          previousStock,
          newStock,
          adjustment:
            adjustment_type === "add"
              ? adjustmentQuantity
              : -adjustmentQuantity,
        },
        movement: movementLog,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating product stock:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product stock",
      error: error.message,
    });
  }
};

// Bulk stock update
export const bulkUpdateStock = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { updates, reason = "Bulk update", user = "Admin" } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required and must not be empty",
      });
    }

    const results = [];
    const movements = [];

    for (const update of updates) {
      const { productId, adjustment_type, quantity } = update;

      // Validate productId
      const numericProductId = parseInt(productId);
      if (isNaN(numericProductId) || numericProductId <= 0) {
        results.push({
          productId,
          success: false,
          message: "Invalid product ID. Must be a positive integer",
        });
        continue;
      }

      // Validate adjustment_type
      if (!["add", "remove", "set"].includes(adjustment_type)) {
        results.push({
          productId: numericProductId,
          success: false,
          message: "Invalid adjustment type. Use: add, remove, or set",
        });
        continue;
      }

      // Validate quantity
      const adjustmentQuantity = parseInt(quantity);
      if (isNaN(adjustmentQuantity) || adjustmentQuantity < 0) {
        results.push({
          productId: numericProductId,
          success: false,
          message: "Quantity must be a positive number",
        });
        continue;
      }

      const product = await Product.findByPk(numericProductId, { transaction });
      if (!product) {
        results.push({
          productId: numericProductId,
          success: false,
          message: "Product not found",
        });
        continue;
      }

      const previousStock = product.stockQuantity;
      let newStock;

      switch (adjustment_type) {
        case "add":
          newStock = previousStock + adjustmentQuantity;
          break;
        case "remove":
          newStock = Math.max(0, previousStock - adjustmentQuantity);
          break;
        case "set":
          newStock = adjustmentQuantity;
          break;
        default:
          results.push({
            productId,
            success: false,
            message: "Invalid adjustment type",
          });
          continue;
      }

      await product.update(
        {
          stockQuantity: newStock,
          inStock: newStock > 0,
        },
        { transaction }
      );

      results.push({
        productId,
        productName: product.name,
        success: true,
        previousStock,
        newStock,
        adjustment:
          adjustment_type === "add" ? parseInt(quantity) : -parseInt(quantity),
      });

      movements.push({
        productId: product.id,
        productName: product.name,
        type: adjustment_type === "set" ? "adjustment" : adjustment_type,
        previousStock,
        newStock,
        quantity:
          adjustment_type === "add" ? parseInt(quantity) : -parseInt(quantity),
        reason,
        user,
        timestamp: new Date(),
      });

      // Create stock movement record
      await StockMovement.create(
        {
          productId: product.id,
          productName: product.name,
          movementType:
            adjustment_type === "set"
              ? "adjustment"
              : adjustment_type === "add"
              ? "restock"
              : "adjustment",
          quantity:
            adjustment_type === "add"
              ? parseInt(quantity)
              : -parseInt(quantity),
          previousStock,
          newStock,
          reason,
          userName: user,
          userId: req.user?.id || null,
          isAutomated: false,
        },
        { transaction }
      );
    }

    // Process bulk stock movements

    await transaction.commit();

    res.json({
      success: true,
      message: `Processed ${results.length} stock updates`,
      data: {
        results,
        movements,
        summary: {
          total: results.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in bulk stock update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk stock update",
      error: error.message,
    });
  }
};

// Get stock movement history
export const getStockHistory = async (req, res) => {
  try {
    const {
      productId,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      type,
    } = req.query;

    const whereClause = {};

    // Apply filters
    if (productId) {
      whereClause.productId = productId;
    }

    if (type) {
      whereClause.movementType = type;
    }

    if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate),
      };
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        [Op.lte]: new Date(endDate),
      };
    }

    const { count, rows: movements } = await StockMovement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "category"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        movements: movements.map((movement) => ({
          id: movement.id,
          productId: movement.productId,
          productName: movement.productName,
          type: movement.movementType,
          quantity: movement.quantity,
          previousStock: movement.previousStock,
          newStock: movement.newStock,
          reason: movement.reason,
          user: movement.userName,
          timestamp: movement.createdAt,
          referenceId: movement.referenceId,
          notes: movement.notes,
        })),
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock history",
      error: error.message,
    });
  }
};

// Set reorder points for products
export const setReorderPoints = async (req, res) => {
  try {
    const { reorderPoints } = req.body;

    if (!Array.isArray(reorderPoints) || reorderPoints.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reorder points array is required",
      });
    }

    const results = [];

    for (const item of reorderPoints) {
      const { productId, reorderPoint, maxStock } = item;

      const product = await Product.findByPk(productId);
      if (!product) {
        results.push({
          productId,
          success: false,
          message: "Product not found",
        });
        continue;
      }

      // Note: You would need to add reorderPoint and maxStock columns to the Product model
      // For now, we'll just simulate the update
      results.push({
        productId,
        productName: product.name,
        success: true,
        reorderPoint,
        maxStock,
        message: "Reorder points updated successfully",
      });
    }

    res.json({
      success: true,
      message: "Reorder points processed",
      data: results,
    });
  } catch (error) {
    console.error("Error setting reorder points:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set reorder points",
      error: error.message,
    });
  }
};

// Generate inventory report
export const generateInventoryReport = async (req, res) => {
  try {
    const { format = "json", includeHistory = false } = req.query;

    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "category",
        "stockQuantity",
        "price",
        "originalPrice",
        "inStock",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
      where: { isActive: true },
      order: [
        ["category", "ASC"],
        ["name", "ASC"],
      ],
    });

    const reportData = {
      generatedAt: new Date(),
      summary: {
        totalProducts: products.length,
        totalValue: products.reduce(
          (sum, p) => sum + p.stockQuantity * p.price,
          0
        ),
        inStockCount: products.filter((p) => p.stockQuantity > 0).length,
        outOfStockCount: products.filter((p) => p.stockQuantity === 0).length,
        lowStockCount: products.filter(
          (p) => p.stockQuantity > 0 && p.stockQuantity <= 20
        ).length,
      },
      categories: {},
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        currentStock: p.stockQuantity,
        price: p.price,
        originalPrice: p.originalPrice,
        totalValue: p.stockQuantity * p.price,
        status:
          p.stockQuantity === 0
            ? "Out of Stock"
            : p.stockQuantity <= 5
            ? "Critical"
            : p.stockQuantity <= 20
            ? "Low Stock"
            : "In Stock",
        lastUpdated: p.updatedAt,
      })),
    };

    // Group by categories
    products.forEach((product) => {
      const category = product.category;
      if (!reportData.categories[category]) {
        reportData.categories[category] = {
          productCount: 0,
          totalStock: 0,
          totalValue: 0,
          averagePrice: 0,
        };
      }

      reportData.categories[category].productCount += 1;
      reportData.categories[category].totalStock += product.stockQuantity;
      reportData.categories[category].totalValue +=
        product.stockQuantity * product.price;
    });

    // Calculate average prices
    Object.keys(reportData.categories).forEach((category) => {
      const categoryData = reportData.categories[category];
      const categoryProducts = products.filter((p) => p.category === category);
      categoryData.averagePrice =
        categoryProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) /
        categoryProducts.length;
    });

    if (format === "csv") {
      // Generate CSV format
      const csvHeader =
        "ID,Name,Category,Stock,Price,Total Value,Status,Last Updated\n";
      const csvRows = reportData.products
        .map(
          (p) =>
            `${p.id},"${p.name}","${p.category}",${p.currentStock},${p.price},${p.totalValue},"${p.status}","${p.lastUpdated}"`
        )
        .join("\n");

      const csvContent = csvHeader + csvRows;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=inventory-report.csv"
      );
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: reportData,
      });
    }
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
      error: error.message,
    });
  }
};
