import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";
import {
  Package,
  FileDown,
  RefreshCw,
  AlertCircle,
  Download,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";

// Import modular components
import ProductStats from "../components/products/ProductStats";
import ProductFilters from "../components/products/ProductFilters";
import ProductTable from "../components/products/ProductTable";
import ProductActions from "../components/products/ProductActions";
import ProductManagementModal from "../components/products/ProductManagementModal";

const ProductsPage = () => {
  console.log("🎯 ProductsPage component rendering...");

  // State management
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [filteredProducts, setFilteredProducts] = useState([]); // Store filtered results
  const [displayedProducts, setDisplayedProducts] = useState([]); // Store paginated results
  const [categories, setCategories] = useState([]); // Store available categories
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    stockStatus: "",
    priceRange: { min: "", max: "" },
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 10,
  });

  // Calculate product statistics
  const calculateProductStats = useCallback((products) => {
    const stats = {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      lowStockProducts: products.filter(
        (p) => p.stockQuantity <= 10 && p.stockQuantity > 0
      ).length,
      outOfStockProducts: products.filter((p) => p.stockQuantity === 0).length,
      totalRevenue: products.reduce(
        (sum, p) => sum + (p.price * p.stockQuantity || 0),
        0
      ),
      averageRating:
        products.length > 0
          ? (
              products.reduce((sum, p) => sum + (p.rating || 0), 0) /
              products.length
            ).toFixed(1)
          : 0,
    };
    return stats;
  }, []);

  // Get current product stats
  const productStats = calculateProductStats(allProducts);

  // Clear all filters
  const clearFilters = () => {
    console.log("🧹 Clearing all filters");
    setFilters({
      search: "",
      status: "",
      category: "",
      stockStatus: "",
      priceRange: { min: "", max: "" },
    });
  };

  // Client-side filtering function
  const applyFilters = useCallback((products, filterCriteria) => {
    return products.filter((product) => {
      // Status filter
      if (filterCriteria.status) {
        if (filterCriteria.status === "active" && !product.isActive)
          return false;
        if (filterCriteria.status === "inactive" && product.isActive)
          return false;
      }

      // Category filter
      if (
        filterCriteria.category &&
        product.category !== filterCriteria.category
      ) {
        return false;
      }

      // Stock status filter
      if (filterCriteria.stockStatus) {
        if (
          filterCriteria.stockStatus === "out_of_stock" &&
          product.stockQuantity > 0
        )
          return false;
        if (
          filterCriteria.stockStatus === "low_stock" &&
          (product.stockQuantity === 0 || product.stockQuantity > 10)
        )
          return false;
        if (
          filterCriteria.stockStatus === "in_stock" &&
          product.stockQuantity <= 10
        )
          return false;
      }

      // Price range filter
      if (
        filterCriteria.priceRange.min &&
        product.price < parseFloat(filterCriteria.priceRange.min)
      ) {
        return false;
      }
      if (
        filterCriteria.priceRange.max &&
        product.price > parseFloat(filterCriteria.priceRange.max)
      ) {
        return false;
      }

      // Search filter
      if (filterCriteria.search && filterCriteria.search.trim()) {
        const searchTerm = filterCriteria.search.toLowerCase();
        const productName = (product.name || "").toLowerCase();
        const productDescription = (product.description || "").toLowerCase();
        const productCategory = (product.category || "").toLowerCase();

        const matchesSearch =
          productName.includes(searchTerm) ||
          productDescription.includes(searchTerm) ||
          productCategory.includes(searchTerm);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, []);

  // Client-side pagination function
  const applyPagination = useCallback((products, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(products.length / limit),
        totalProducts: products.length,
        limit: limit,
      },
    };
  }, []);

  // Update filtered and paginated products when filters or page changes
  const updateDisplayedProducts = useCallback(() => {
    console.log("📊 Updating displayed products with filters:", filters);

    // Apply filters
    const filtered = applyFilters(allProducts, filters);
    setFilteredProducts(filtered);

    // Apply pagination
    const paginated = applyPagination(
      filtered,
      pagination.currentPage,
      pagination.limit
    );
    setDisplayedProducts(paginated.products);
    setPagination(paginated.pagination);

    console.log(
      `📦 Filtered ${filtered.length} products from ${allProducts.length} total`
    );
  }, [
    allProducts,
    filters,
    pagination.currentPage,
    pagination.limit,
    applyFilters,
    applyPagination,
  ]);

  // Fetch all products once
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📡 Fetching all products from server...");

      // Fetch all products using the existing /products endpoint with large limit
      // Remove isActive filter to get both active and inactive products for admin view
      const response = await axiosInstance.get("/products?limit=1000&page=1");
      console.log("📦 Products API response:", response.data);

      if (response.data && response.data.success) {
        const fetchedProducts = response.data.data;
        console.log(
          `✅ Fetched ${fetchedProducts?.length || 0} total products`
        );

        setAllProducts(fetchedProducts || []);
      } else {
        throw new Error(response.data?.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("❌ Fetch products error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch products";
      setError(errorMessage);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available categories
  const fetchCategories = useCallback(async () => {
    try {
      console.log("📡 Fetching categories...");
      const response = await axiosInstance.get("/products/categories");

      if (response.data && response.data.success) {
        setCategories(response.data.data || []);
        console.log("✅ Fetched categories:", response.data.data);
      }
    } catch (err) {
      console.error("❌ Fetch categories error:", err);
      // Don't set error for categories as it's not critical
    }
  }, []);

  // Fetch products and categories on component mount
  useEffect(() => {
    console.log(
      "🚀 ProductsPage mounted - calling fetchAllProducts and fetchCategories"
    );
    fetchAllProducts();
    fetchCategories();
  }, [fetchAllProducts, fetchCategories]);

  // Update displayed products when filters or allProducts change
  useEffect(() => {
    if (allProducts.length > 0) {
      updateDisplayedProducts();
    }
  }, [allProducts, filters, updateDisplayedProducts]);

  // Handle page change
  const handlePageChange = (newPage) => {
    console.log("📄 Changing to page:", newPage);
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    console.log("🎛️ Filters changed:", newFilters);
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log("🔄 Refreshing products");
    fetchAllProducts();
    fetchCategories();
  };

  // Handle stock update
  // Handle product actions
  const handleAddNew = () => {
    setSelectedProduct(null);
    setModalMode("create");
    setShowManagementModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalMode("edit");
    setShowManagementModal(true);
  };

  const handleCloseModal = () => {
    setShowManagementModal(false);
    setSelectedProduct(null);
    setModalMode("view");
  };

  const handleModalSave = () => {
    handleCloseModal();
    handleRefresh();
  };

  // Handle export (Enhanced version with multiple formats)
  const handleExport = (format = "csv") => {
    console.log("📊 Exporting products as", format);

    try {
      // Use filtered products for export (respects current filters)
      const productsToExport =
        filteredProducts.length > 0 ? filteredProducts : allProducts;

      if (productsToExport.length === 0) {
        alert("No products to export!");
        return;
      }

      // Show loading state briefly
      setLoading(true);

      // Prepare data for export with comprehensive product information
      const exportData = productsToExport.map((product) => ({
        "Product ID": product.id,
        Name: product.name || "N/A",
        Category: product.category || "N/A",
        Description: product.description || "N/A",
        Price: `₹${
          product.price ? parseFloat(product.price).toFixed(2) : "0.00"
        }`,
        "Original Price": `₹${
          product.originalPrice
            ? parseFloat(product.originalPrice).toFixed(2)
            : "0.00"
        }`,
        Discount:
          product.originalPrice && product.price
            ? `${(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                100
              ).toFixed(1)}%`
            : "0%",
        "Stock Quantity": product.stockQuantity || 0,
        Status: product.isActive ? "Active" : "Inactive",
        SKU: product.sku || "N/A",
        Brand: product.brand || "N/A",
        Weight: product.weight ? `${product.weight}g` : "N/A",
        Rating: product.rating || 0,
        "Review Count": product.reviewCount || 0,
        Tags: product.tags
          ? Array.isArray(product.tags)
            ? product.tags.join(", ")
            : product.tags
          : "N/A",
        Featured: product.isFeatured ? "Yes" : "No",
        "Created Date": product.createdAt
          ? new Date(product.createdAt).toLocaleDateString()
          : "N/A",
        "Updated Date": product.updatedAt
          ? new Date(product.updatedAt).toLocaleDateString()
          : "N/A",
      }));

      // Add a small delay to show loading state
      setTimeout(() => {
        try {
          if (format === "csv") {
            exportToCSV(
              exportData,
              `products_export_${new Date().toISOString().split("T")[0]}.csv`
            );
          } else if (format === "excel") {
            exportToExcel(
              exportData,
              `products_export_${new Date().toISOString().split("T")[0]}.xlsx`
            );
          }

          // Show success message
          alert(
            `Successfully exported ${
              productsToExport.length
            } products as ${format.toUpperCase()}!`
          );
        } catch (exportError) {
          console.error("Export error:", exportError);
          alert("Failed to export products. Please try again.");
        } finally {
          setLoading(false);
        }
      }, 500);
    } catch (error) {
      console.error("Export preparation error:", error);
      alert("Failed to prepare export data. Please try again.");
      setLoading(false);
    }
  };

  // Enhanced Export to CSV function
  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    try {
      // Get headers
      const headers = Object.keys(data[0]);

      // Create CSV content with UTF-8 BOM for proper Excel compatibility
      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += headers.join(",") + "\n";

      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Escape commas, quotes, and line breaks in values
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"') || value.includes("\n"))
          ) {
            return `"${value.replace(/"/g, '""').replace(/\n/g, " ")}"`;
          }
          return value;
        });
        csvContent += values.join(",") + "\n";
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset-utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (error) {
      console.error("CSV export error:", error);
      throw new Error(`Failed to create CSV file: ${error.message}`);
    }
  };

  // Export to Excel function
  const exportToExcel = (data, filename) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();

      // Set column widths for better readability
      const colWidths = [
        { wch: 10 }, // Product ID
        { wch: 25 }, // Name
        { wch: 15 }, // Category
        { wch: 40 }, // Description
        { wch: 10 }, // Price
        { wch: 12 }, // Original Price
        { wch: 10 }, // Discount
        { wch: 10 }, // Stock
        { wch: 10 }, // Status
        { wch: 15 }, // SKU
        { wch: 15 }, // Brand
        { wch: 10 }, // Weight
        { wch: 8 }, // Rating
        { wch: 10 }, // Review Count
        { wch: 30 }, // Tags
        { wch: 10 }, // Featured
        { wch: 12 }, // Created Date
        { wch: 12 }, // Updated Date
      ];
      ws["!cols"] = colWidths;

      // Add some basic styling to headers
      const headerCells = Object.keys(data[0] || {});
      headerCells.forEach((header, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E6F3FF" } },
            border: {
              bottom: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
      });

      XLSX.utils.book_append_sheet(wb, ws, "Products Export");

      // Add metadata sheet
      const metaData = [
        { Field: "Export Date", Value: new Date().toLocaleDateString() },
        { Field: "Export Time", Value: new Date().toLocaleTimeString() },
        { Field: "Total Records", Value: data.length },
        { Field: "Export Format", Value: "Excel (.xlsx)" },
        { Field: "Generated By", Value: "Fog & Leaf Admin Panel" },
      ];
      const metaWs = XLSX.utils.json_to_sheet(metaData);
      XLSX.utils.book_append_sheet(wb, metaWs, "Export Info");

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Excel export error:", error);
      throw new Error(`Failed to create Excel file: ${error.message}`);
    }
  };

  console.log("🎨 Rendering ProductsPage with:", {
    productsCount: displayedProducts.length,
    totalProducts: filteredProducts.length,
    allProductsCount: allProducts.length,
    loading,
    error,
    filters,
    pagination,
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Products Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleExport("csv");
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        handleExport("excel");
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export as Excel
                    </button>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-2">
                    <p className="text-xs text-gray-500">
                      Will export{" "}
                      {filteredProducts.length > 0
                        ? filteredProducts.length
                        : allProducts.length}{" "}
                      product
                      {(filteredProducts.length > 0
                        ? filteredProducts.length
                        : allProducts.length) !== 1
                        ? "s"
                        : ""}
                      {filteredProducts.length > 0 ? " (filtered)" : " (all)"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Click outside to close dropdown */}
            {showExportDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowExportDropdown(false)}
              />
            )}
          </div>
        </div>

        {/* Product Statistics */}
        <ProductStats stats={productStats} loading={loading} />

        {/* Filters */}
        <ProductFilters
          filters={filters}
          onFilterChange={handleFiltersChange}
          categories={categories}
          onClearFilters={clearFilters}
        />

        {/* Results Summary & Error Display */}
        {!loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {pagination.totalProducts} product
                {pagination.totalProducts !== 1 ? "s" : ""} found
                {(filters.search ||
                  filters.status ||
                  filters.category ||
                  filters.stockStatus ||
                  filters.priceRange.min ||
                  filters.priceRange.max) &&
                  " with current filters"}
              </span>
              {pagination.totalProducts > 0 && (
                <span className="text-blue-600 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={handleRefresh}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Add Product Action */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Actions</h3>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <ProductTable
          products={displayedProducts}
          loading={loading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEditProduct}
        />

        {/* Product Management Modal */}
        <ProductManagementModal
          product={selectedProduct}
          mode={modalMode}
          onClose={handleCloseModal}
          onSave={handleModalSave}
          isOpen={showManagementModal}
        />
      </div>
    </Layout>
  );
};

export default ProductsPage;
