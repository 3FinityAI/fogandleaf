import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";

// Import modular components
import OrdersHeader from "../components/orders/OrdersHeader";
import OrderFilters from "../components/orders/OrderFilters";
import OrdersSummary from "../components/orders/OrdersSummary";
import OrdersTable from "../components/orders/OrdersTable";
import OrdersPagination from "../components/orders/OrdersPagination";
import OrderManagementModal from "../components/orders/OrderManagementModal";

const OrdersPage = () => {
  console.log("🎯 OrdersPage component rendering...");

  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showManagementModal, setShowManagementModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: "",
    today: false,
    thisWeek: false,
    thisMonth: false,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
  });

  // Clear all filters
  const clearFilters = () => {
    console.log("🧹 Clearing all filters");
    setFilters({
      search: "",
      status: "",
      paymentStatus: "",
      dateFrom: "",
      dateTo: "",
      today: false,
      thisWeek: false,
      thisMonth: false,
    });
  };

  // Fetch orders function with pagination and filters
  const fetchOrders = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        console.log("📡 Fetching orders with filters:", filters, "page:", page);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        // Add filters to params
        if (filters.search) params.append("search", filters.search);
        if (filters.status) params.append("status", filters.status);
        if (filters.paymentStatus)
          params.append("paymentStatus", filters.paymentStatus);
        if (filters.dateFrom) params.append("startDate", filters.dateFrom);
        if (filters.dateTo) params.append("endDate", filters.dateTo);

        const apiUrl = `/admin/orders?${params}`;
        console.log("🔗 API call URL:", apiUrl);

        const response = await axiosInstance.get(apiUrl);
        console.log("📦 Orders API response:", response.data);

        if (response.data && response.data.success) {
          const { orders: fetchedOrders, pagination: paginationData } =
            response.data.data;
          console.log(
            "✅ Orders fetched successfully:",
            fetchedOrders?.length || 0,
            "orders"
          );
          console.log("📋 Sample order data:", fetchedOrders?.[0]); // Log first order to see structure

          setOrders(fetchedOrders || []);
          setPagination({
            currentPage: paginationData.currentPage,
            totalPages: paginationData.totalPages,
            totalOrders: paginationData.totalOrders,
            limit: 10,
          });
        } else {
          throw new Error(response.data?.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("❌ Fetch orders error:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch orders";
        setError(errorMessage);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Fetch orders on component mount
  useEffect(() => {
    console.log("🚀 OrdersPage mounted - calling fetchOrders");
    fetchOrders(1);
  }, [fetchOrders]);

  // Handle status update
  const handleStatusUpdate = (orderId, updates) => {
    console.log("🔄 Updating order status:", orderId, updates);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    console.log("📄 Changing to page:", newPage);
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    console.log("🎛️ Filters changed:", newFilters);
    setFilters(newFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log("🔄 Refreshing orders");
    fetchOrders(pagination.currentPage);
  };

  // Handle export
  const handleExport = () => {
    console.log("📊 Exporting orders");
    // TODO: Implement export functionality
    alert("Export functionality coming soon!");
  };

  // Handle manage order (view details + edit status)
  const handleManageOrder = (order) => {
    console.log("⚙️ Managing order:", order.id);
    setSelectedOrder(order);
    setShowManagementModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    console.log("❌ Closing modal");
    setSelectedOrder(null);
    setShowManagementModal(false);
  };

  // Handle retry
  const handleRetry = () => {
    console.log("🔄 Retrying fetch orders");
    fetchOrders(pagination.currentPage);
  };

  console.log("🎨 Rendering OrdersPage with:", {
    ordersCount: orders.length,
    loading,
    error,
    filters,
    pagination,
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <OrdersHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          loading={loading}
        />

        {/* Robust Filtering System */}
        <OrderFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
        />

        {/* Results Summary & Error Display */}
        <OrdersSummary
          pagination={pagination}
          filters={filters}
          loading={loading}
          error={error}
          onRetry={handleRetry}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          loading={loading}
          onManageOrder={handleManageOrder}
        />

        {/* Pagination */}
        <OrdersPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />

        {/* Order Management Modal */}
        <OrderManagementModal
          order={selectedOrder}
          isOpen={showManagementModal}
          onClose={handleCloseModal}
          onUpdate={handleStatusUpdate}
        />
      </div>
    </Layout>
  );
};

export default OrdersPage;
