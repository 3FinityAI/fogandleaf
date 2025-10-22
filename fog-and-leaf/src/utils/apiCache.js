const PRODUCTS_STORAGE_KEY = "fog_leaf_products";
const PRODUCTS_CACHE_TIME_KEY = "fog_leaf_products_time";
const CACHE_DURATION_MS = 60 * 1000; // 1 minute

// Store products and cache timestamp
const setProductData = (products) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products || []));
    localStorage.setItem(PRODUCTS_CACHE_TIME_KEY, Date.now().toString());
    // (Debug log removed)
  } catch (error) {
    console.warn("Failed to store products:", error);
  }
};

const getProductData = () => {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const storedTime = localStorage.getItem(PRODUCTS_CACHE_TIME_KEY);
    const now = Date.now();
    if (
      stored &&
      storedTime &&
      now - parseInt(storedTime, 10) < CACHE_DURATION_MS
    ) {
      return JSON.parse(stored);
    } else {
      // Cache expired or missing
      localStorage.removeItem(PRODUCTS_STORAGE_KEY);
      localStorage.removeItem(PRODUCTS_CACHE_TIME_KEY);
      return [];
    }
  } catch (error) {
    console.warn("Failed to get products:", error);
    return [];
  }
};

const clearProductData = () => {
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(PRODUCTS_CACHE_TIME_KEY);
    // (Debug log removed)
  } catch (error) {
    console.warn("Failed to clear products:", error);
  }
};

// Product management - Single source of truth
const cacheProducts = (products) => {
  if (!Array.isArray(products)) return;
  setProductData(products);
};

// Product filtering implementation
const filterProducts = (products, criteria = {}) => {
  if (!Array.isArray(products) || products.length === 0) return [];

  let filtered = [...products];

  if (criteria.category) {
    filtered = filtered.filter((p) =>
      p.category?.toLowerCase().includes(criteria.category.toLowerCase())
    );
  }

  if (criteria.minRating) {
    filtered = filtered.filter((p) => p.rating >= criteria.minRating);
  }

  if (criteria.inStock) {
    filtered = filtered.filter((p) => p.inStock && p.stockQuantity > 0);
  }

  if (criteria.search) {
    const searchTerm = criteria.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
    );
  }

  if (criteria.limit && criteria.limit > 0) {
    filtered = filtered.slice(0, criteria.limit);
  }

  return filtered;
};

// Product queries
const getProductById = (productId) => {
  const products = getProductData();
  return products.find((p) => p.id == productId) || null;
};

const getFeaturedProducts = (limit = 3) => {
  const products = getProductData();
  return filterProducts(products, { minRating: 4.5, limit });
};

const getProductsByCategory = (category, limit = null) => {
  const products = getProductData();
  return filterProducts(products, { category, limit });
};

const searchProducts = (searchTerm, filters = {}) => {
  const products = getProductData();
  return filterProducts(products, { ...filters, search: searchTerm });
};

import fallbackProducts from "../data/productData";

const fetchAndCacheProducts = async (apiCall) => {
  try {
    // Check if products are cached
    const cachedProducts = getProductData();
    if (cachedProducts.length > 0) {
      // (Debug log removed)
      return cachedProducts;
    }

    // Fetch products from API
    const products = await apiCall();

    // Cache products
    cacheProducts(products);

    return products;
  } catch (error) {
    // (Error log removed)

    // Try to return stale cache if available
    const staleProducts = getProductData();
    if (staleProducts.length > 0) {
      console.warn("API failed, using cached products");
      return staleProducts;
    }

    // If no cache, use fallback products
    console.warn("API and cache failed, using fallback products");
    cacheProducts(fallbackProducts);
    return fallbackProducts;
  }
};

// API for product caching only
const ApiCache = {
  // Core product storage
  setProductData,
  getProductData,
  clearProductData,

  // Product management
  cacheProducts,
  filterProducts,
  fetchAndCacheProducts,

  // Product queries
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
};

export default ApiCache;
