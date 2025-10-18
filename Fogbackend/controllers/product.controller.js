import { Product } from "../models/index.js";
import { Op } from "sequelize";
import { v2 as cloudinary } from "cloudinary";

// Utility function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (cloudinaryUrl) => {
  try {
    const urlParts = cloudinaryUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

// Get all products with filtering and pagination
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
      isActive,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasNext: parseInt(page) < Math.ceil(count / limit),
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// Get product categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: ["category"],
      group: ["category"],
      raw: true,
    });

    const categoryList = [...new Set(categories.map((item) => item.category))];

    res.json({
      success: true,
      data: categoryList,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// Admin: Create product
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    const allowedCategories = [
      "Black Tea",
      "Blended Tea",
      "Green Tea",
      "Herbal Tea",
      "Oolong Tea",
      "White Tea",
    ];

    const requiredFields = ["name", "category", "price", "stockQuantity"];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!allowedCategories.includes(productData.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed categories: ${allowedCategories.join(
          ", "
        )}`,
      });
    }

    if (
      isNaN(parseFloat(productData.price)) ||
      parseFloat(productData.price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }

    if (
      isNaN(parseInt(productData.stockQuantity)) ||
      parseInt(productData.stockQuantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative integer",
      });
    }

    // Process arrays properly (only once)
    const processedImageUrl = Array.isArray(productData.imageUrl)
      ? productData.imageUrl
      : productData.imageUrl
      ? [productData.imageUrl]
      : [];

    const processedFeatures = Array.isArray(productData.features)
      ? productData.features
      : productData.features
      ? productData.features
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item)
      : [];

    const processedTags = Array.isArray(productData.tags)
      ? productData.tags
      : productData.tags
      ? productData.tags
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item)
      : [];

    const completeProductData = {
      // Basic information
      name: productData.name.trim(),
      description: productData.description
        ? productData.description.trim()
        : "",
      longDescription: productData.longDescription
        ? productData.longDescription.trim()
        : "",
      category: productData.category,

      // Pricing and inventory
      price: parseFloat(productData.price),
      originalPrice: productData.originalPrice
        ? parseFloat(productData.originalPrice)
        : null,
      weight: productData.weight ? parseFloat(productData.weight) : 100,
      stockQuantity: parseInt(productData.stockQuantity),

      // Status flags
      isActive:
        productData.isActive !== undefined
          ? Boolean(productData.isActive)
          : true,
      inStock:
        productData.inStock !== undefined ? Boolean(productData.inStock) : true,

      // Default values for new products
      rating: 0.0,
      reviewCount: 0,

      // Arrays
      imageUrl: processedImageUrl,
      features: processedFeatures,
      tags: processedTags,

      // Optional fields
      brewingInstructions: productData.brewingInstructions
        ? productData.brewingInstructions.trim()
        : null,
      origin: productData.origin ? productData.origin.trim() : null,
    };

    // Create product with complete data
    const product = await Product.create(completeProductData);

    // Format response to match your desired structure
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      longDescription: product.longDescription || "",
      category: product.category,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      weight: parseFloat(product.weight),
      stockQuantity: parseInt(product.stockQuantity),
      inStock: product.inStock,
      rating: parseFloat(product.rating) || 0.0,
      reviewCount: parseInt(product.reviewCount) || 0,
      isActive: product.isActive,
      features: Array.isArray(product.features) ? product.features : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      brewingInstructions: product.brewingInstructions || null,
      origin: product.origin || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl : [],
    };

    res.status(201).json({
      success: true,
      data: formattedProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Create product error:", error);

    // Handle PostgreSQL unique constraint violation
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.original?.code === "23505"
    ) {
      // Check if it's a primary key constraint (ID collision)
      if (error.original?.constraint === "products_pkey") {
        return res.status(500).json({
          success: false,
          message:
            "Database sequence error. Please contact support or try again.",
          error: "Database ID sequence needs reset",
        });
      }

      // Other unique constraint violations
      return res.status(409).json({
        success: false,
        message:
          "A product with this information already exists. Please check for duplicates.",
        error: "Duplicate product detected",
      });
    }

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    // Handle database connection errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        success: false,
        message: "Database error occurred. Please try again later.",
        error: "Database connection issue",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Admin: Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await Product.findByPk(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate category if provided
    if (updateData.category) {
      const allowedCategories = [
        "Black Tea",
        "Blended Tea",
        "Green Tea",
        "Herbal Tea",
        "Oolong Tea",
        "White Tea",
      ];

      if (!allowedCategories.includes(updateData.category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories: ${allowedCategories.join(
            ", "
          )}`,
        });
      }
    }

    // Validate numeric fields if provided
    if (updateData.price !== undefined) {
      if (
        isNaN(parseFloat(updateData.price)) ||
        parseFloat(updateData.price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
      }
    }

    if (updateData.stockQuantity !== undefined) {
      if (
        isNaN(parseInt(updateData.stockQuantity)) ||
        parseInt(updateData.stockQuantity) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock quantity must be a non-negative integer",
        });
      }
    }

    // Ensure imageUrl is an array
    if (updateData.imageUrl && !Array.isArray(updateData.imageUrl)) {
      updateData.imageUrl = [updateData.imageUrl];
    }

    // Ensure features and tags are arrays
    if (updateData.features && !Array.isArray(updateData.features)) {
      updateData.features = updateData.features
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }

    if (updateData.tags && !Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }

    // Update product
    const [updatedRowsCount] = await Product.update(updateData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes made to the product",
      });
    }

    // Fetch updated product
    const updatedProduct = await Product.findByPk(id);

    // Format response to match desired structure
    const formattedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description || "",
      longDescription: updatedProduct.longDescription || "",
      category: updatedProduct.category,
      price: parseFloat(updatedProduct.price),
      originalPrice: updatedProduct.originalPrice
        ? parseFloat(updatedProduct.originalPrice)
        : null,
      weight: parseFloat(updatedProduct.weight),
      stockQuantity: parseInt(updatedProduct.stockQuantity),
      inStock: updatedProduct.inStock,
      rating: parseFloat(updatedProduct.rating) || 0.0,
      reviewCount: parseInt(updatedProduct.reviewCount) || 0,
      isActive: updatedProduct.isActive,
      features: Array.isArray(updatedProduct.features)
        ? updatedProduct.features
        : [],
      tags: Array.isArray(updatedProduct.tags) ? updatedProduct.tags : [],
      brewingInstructions: updatedProduct.brewingInstructions || null,
      origin: updatedProduct.origin || null,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
      imageUrl: Array.isArray(updatedProduct.imageUrl)
        ? updatedProduct.imageUrl
        : [],
    };

    res.json({
      success: true,
      data: formattedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);

    // Handle product not found during update
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(404).json({
        success: false,
        message: "Product not found or reference constraint violation",
      });
    }

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    // Handle database connection errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        success: false,
        message: "Database error occurred. Please try again later.",
        error: "Database connection issue",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Admin: Delete product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query; // Allow permanent deletion

    if (permanent === "true") {
      // Hard delete: remove product and associated images
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Delete associated images from Cloudinary
      if (product.imageUrl && Array.isArray(product.imageUrl)) {
        const publicIds = product.imageUrl
          .map((url) => extractPublicIdFromUrl(url))
          .filter((id) => id); // Filter out null values

        if (publicIds.length > 0) {
          try {
            await cloudinary.api.delete_resources(publicIds);
            // Images deleted from Cloudinary
          } catch (cloudinaryError) {
            console.error(
              "Failed to delete images from Cloudinary:",
              cloudinaryError
            );
            // Continue with product deletion even if Cloudinary deletion fails
          }
        }
      }

      // Delete product from database
      await Product.destroy({ where: { id } });

      res.json({
        success: true,
        message: "Product permanently deleted successfully",
      });
    } else {
      // Soft delete: set isActive to false
      const [updatedRowsCount] = await Product.update(
        { isActive: false },
        { where: { id } }
      );

      if (updatedRowsCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    }
  } catch (error) {
    console.error("Delete product error:", error);

    // Handle foreign key constraint violations (if product is referenced elsewhere)
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete product. It may be referenced in orders or other records.",
        error: "Foreign key constraint violation",
      });
    }

    // Handle database connection errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        success: false,
        message: "Database error occurred. Please try again later.",
        error: "Database connection issue",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// Admin: Restore soft-deleted product
export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRowsCount] = await Product.update(
      { isActive: true },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const restoredProduct = await Product.findByPk(id);

    res.json({
      success: true,
      data: restoredProduct,
      message: "Product restored successfully",
    });
  } catch (error) {
    console.error("Restore product error:", error);

    // Handle database connection errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        success: false,
        message: "Database error occurred. Please try again later.",
        error: "Database connection issue",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to restore product",
      error: error.message,
    });
  }
};

// Admin: Bulk operations
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs array is required",
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Update data is required",
      });
    }

    // Remove id from updateData to prevent updating primary key
    delete updateData.id;

    const [updatedRowsCount] = await Product.update(updateData, {
      where: { id: { [Op.in]: productIds } },
    });

    res.json({
      success: true,
      message: `${updatedRowsCount} products updated successfully`,
      updatedCount: updatedRowsCount,
    });
  } catch (error) {
    console.error("Bulk update products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update products",
      error: error.message,
    });
  }
};

// Admin: Update product images
export const updateProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrls, action = "replace" } = req.body; // action: 'replace', 'add', 'remove'

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let updatedImages = [];

    switch (action) {
      case "replace":
        updatedImages = Array.isArray(imageUrls) ? imageUrls : [];
        break;

      case "add":
        const currentImages = Array.isArray(product.imageUrl)
          ? product.imageUrl
          : [];
        const newImages = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
        updatedImages = [...currentImages, ...newImages];
        break;

      case "remove":
        const existingImages = Array.isArray(product.imageUrl)
          ? product.imageUrl
          : [];
        const imagesToRemove = Array.isArray(imageUrls)
          ? imageUrls
          : [imageUrls];
        updatedImages = existingImages.filter(
          (img) => !imagesToRemove.includes(img)
        );

        // Delete removed images from Cloudinary
        const publicIdsToDelete = imagesToRemove
          .map((url) => extractPublicIdFromUrl(url))
          .filter((id) => id);

        if (publicIdsToDelete.length > 0) {
          try {
            await cloudinary.api.delete_resources(publicIdsToDelete);
          } catch (cloudinaryError) {
            console.error(
              "Failed to delete images from Cloudinary:",
              cloudinaryError
            );
            // Continue with database update even if Cloudinary deletion fails
          }
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action. Use 'replace', 'add', or 'remove'",
        });
    }

    // Update product with new images
    await Product.update({ imageUrl: updatedImages }, { where: { id } });

    const updatedProduct = await Product.findByPk(id);

    res.json({
      success: true,
      data: updatedProduct,
      message: `Product images ${action}d successfully`,
    });
  } catch (error) {
    console.error("Update product images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product images",
      error: error.message,
    });
  }
};
