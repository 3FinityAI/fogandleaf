import { useState, useEffect, useCallback } from "react";
import ApiCache from "../utils/apiCache";
import axiosInstance from "../utility/axiosInstance";

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  const fetchAllProducts = useCallback(
    async (forceRefresh = false) => {
      if (loading) return;

      try {
        setLoading(true);
        setError(null);

        if (forceRefresh) {
          ApiCache.clearProductData();
        }

        const products = await ApiCache.fetchAndCacheProducts(async () => {
          const response = await axiosInstance.get("/products");
          return response.data.data || [];
        });

        setAllProducts(products);
        setLastFetch(new Date());
      } catch (err) {
        // console.error("Error fetching products:", err);
        setError("Failed to load products");

        // Fallback to cached products
        const cachedProducts = ApiCache.getProductData();
        if (cachedProducts.length > 0) {
          setAllProducts(cachedProducts);
          setError("Showing cached products (offline mode)");
        }
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const searchProducts = useCallback(
    (searchTerm, filters = {}) => ApiCache.searchProducts(searchTerm, filters),
    []
  );

  const getProductById = useCallback(
    (productId) => ApiCache.getProductById(productId),
    []
  );

  const getFeaturedProducts = useCallback(
    (limit = 3) => ApiCache.getFeaturedProducts(limit),
    []
  );

  const getProductsByCategory = useCallback(
    (category, limit = null) => ApiCache.getProductsByCategory(category, limit),
    []
  );

  useEffect(() => {
    // Check if we have cached products first
    const cachedProducts = ApiCache.getProductData();
    if (cachedProducts.length > 0 && !forceRefresh) {
      setAllProducts(cachedProducts);
      setLastFetch(new Date()); // Indicate we have data
    }

    // Always try to fetch fresh data (will use cache if not expired)
    fetchAllProducts(forceRefresh);
    if (forceRefresh) setForceRefresh(false); // Reset after refresh
  }, [forceRefresh]);

  return {
    // State
    allProducts,
    loading,
    error,
    lastFetch,
    forceRefresh,

    // Actions
    fetchAllProducts,
    setForceRefresh,

    // Search & Filter
    searchProducts,
    getProductById,
    getFeaturedProducts,
    getProductsByCategory,

    // Utilities
    hasProducts: allProducts.length > 0,
    productCount: allProducts.length,
  };
};
