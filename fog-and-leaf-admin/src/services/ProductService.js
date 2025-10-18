/**
 * Product Service
 * Handles all product-related API operations
 */

import axiosInstance from "../utils/axiosInstance";

/**
 * Get all products with filtering and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Products data with pagination
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/products", { params });
    return response.data;
  } catch (error) {
    console.error("Get products failed:", error);
    throw new Error(
      `Failed to fetch products: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Get a single product by ID
 * @param {string|number} id - Product ID
 * @returns {Promise<Object>} - Product data
 */
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get product failed:", error);
    throw new Error(
      `Failed to fetch product: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product data
 */
export const createProduct = async (productData) => {
  try {
    // Validate required fields
    const requiredFields = ["name", "category", "price", "stockQuantity"];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Format data for API
    const formattedData = formatProductData(productData);

    const response = await axiosInstance.post("/products", formattedData);
    return response.data;
  } catch (error) {
    console.error("Create product failed:", error);

    // Handle specific error types
    if (error.response?.status === 409) {
      throw new Error(
        "Product already exists. Please check for duplicates or try again."
      );
    }

    if (error.response?.status === 400) {
      throw new Error(
        error.response.data?.message || "Invalid product data provided."
      );
    }

    if (error.response?.status >= 500) {
      throw new Error("Server error occurred. Please try again later.");
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create product"
    );
  }
};

/**
 * Update an existing product
 * @param {string|number} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} - Updated product data
 */
export const updateProduct = async (id, productData) => {
  try {
    const formattedData = formatProductData(productData);
    const response = await axiosInstance.put(`/products/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error("Update product failed:", error);

    // Handle specific error types
    if (error.response?.status === 404) {
      throw new Error("Product not found. It may have been deleted.");
    }

    if (error.response?.status === 400) {
      throw new Error(
        error.response.data?.message || "Invalid product data provided."
      );
    }

    if (error.response?.status >= 500) {
      throw new Error("Server error occurred. Please try again later.");
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update product"
    );
  }
};

/**
 * Delete a product
 * @param {string|number} id - Product ID
 * @param {boolean} permanent - Whether to permanently delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteProduct = async (id, permanent = false) => {
  try {
    console.log(`Deleting product ${id}, permanent: ${permanent}`);
    const params = permanent ? { permanent: true } : {};
    const response = await axiosInstance.delete(`/products/${id}`, { params });
    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete product failed:", error);

    // Handle specific error types
    if (error.response?.status === 404) {
      throw new Error("Product not found. It may have already been deleted.");
    }

    if (error.response?.status === 400) {
      throw new Error(
        error.response.data?.message ||
          "Cannot delete this product. It may be referenced in orders."
      );
    }

    if (error.response?.status >= 500) {
      throw new Error("Server error occurred. Please try again later.");
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete product"
    );
  }
};

/**
 * Restore a soft-deleted product
 * @param {string|number} id - Product ID
 * @returns {Promise<Object>} - Restored product data
 */
export const restoreProduct = async (id) => {
  try {
    const response = await axiosInstance.patch(`/products/${id}/restore`);
    return response.data;
  } catch (error) {
    console.error("Restore product failed:", error);
    throw new Error(
      `Failed to restore product: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Get product categories
 * @returns {Promise<string[]>} - Array of categories
 */
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get("/products/categories");
    return response.data;
  } catch (error) {
    console.error("Get categories failed:", error);
    throw new Error(
      `Failed to fetch categories: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Bulk update products
 * @param {Array} productIds - Array of product IDs
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Bulk update result
 */
export const bulkUpdateProducts = async (productIds, updateData) => {
  try {
    const response = await axiosInstance.patch("/products/bulk", {
      productIds,
      updateData,
    });
    return response.data;
  } catch (error) {
    console.error("Bulk update failed:", error);
    throw new Error(
      `Failed to bulk update products: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Format product data for API submission
 * @param {Object} productData - Raw product data
 * @returns {Object} - Formatted product data
 */
export const formatProductData = (productData) => {
  return {
    // Basic information
    name: productData.name?.trim(),
    description: productData.description?.trim() || "",
    longDescription: productData.longDescription?.trim() || "",
    category: productData.category,

    // Pricing and inventory
    price: parseFloat(productData.price) || 0,
    originalPrice: productData.originalPrice
      ? parseFloat(productData.originalPrice)
      : null,
    weight: parseFloat(productData.weight) || 100,
    stockQuantity: parseInt(productData.stockQuantity) || 0,

    // Status flags
    isActive:
      productData.isActive !== undefined ? Boolean(productData.isActive) : true,
    inStock:
      productData.inStock !== undefined ? Boolean(productData.inStock) : true,

    // Arrays - ensure they're properly formatted
    imageUrl: Array.isArray(productData.imageUrl) ? productData.imageUrl : [],
    features: formatArray(productData.features),
    tags: formatArray(productData.tags),

    // Optional fields
    brewingInstructions: productData.brewingInstructions?.trim() || null,
    origin: productData.origin?.trim() || null,
  };
};

/**
 * Format array data (handle both arrays and comma-separated strings)
 * @param {Array|string} data - Array or comma-separated string
 * @returns {Array} - Formatted array
 */
export const formatArray = (data) => {
  if (Array.isArray(data)) {
    return data.filter((item) => item && item.trim());
  }

  if (typeof data === "string") {
    return data
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
  }

  return [];
};

/**
 * Get allowed categories (for validation)
 * @returns {Array} - Array of allowed categories
 */
export const getAllowedCategories = () => {
  return [
    "Black Tea",
    "Blended Tea",
    "Green Tea",
    "Herbal Tea",
    "Oolong Tea",
    "White Tea",
  ];
};

/**
 * Validate product data before submission
 * @param {Object} productData - Product data to validate
 * @returns {Object} - Validation result
 */
export const validateProductData = (productData) => {
  const errors = [];
  const allowedCategories = getAllowedCategories();

  // Required fields validation
  if (!productData.name?.trim()) {
    errors.push("Product name is required");
  }

  if (!productData.category) {
    errors.push("Category is required");
  } else if (!allowedCategories.includes(productData.category)) {
    errors.push(`Invalid category. Allowed: ${allowedCategories.join(", ")}`);
  }

  if (
    !productData.price ||
    isNaN(parseFloat(productData.price)) ||
    parseFloat(productData.price) < 0
  ) {
    errors.push("Valid price is required");
  }

  if (
    !productData.stockQuantity ||
    isNaN(parseInt(productData.stockQuantity)) ||
    parseInt(productData.stockQuantity) < 0
  ) {
    errors.push("Valid stock quantity is required");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};
