import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";
import * as XLSX from "xlsx";

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
  const [allOrders, setAllOrders] = useState([]); // Store all orders
  const [filteredOrders, setFilteredOrders] = useState([]); // Store filtered results
  const [displayedOrders, setDisplayedOrders] = useState([]); // Store paginated results
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

  // Calculate order statistics
  const calculateOrderStats = useCallback((orders) => {
    const stats = {
      totalOrders: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.status?.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(stats, status)) {
        stats[status]++;
      }
    });

    return stats;
  }, []);

  // Get current order stats
  const orderStats = calculateOrderStats(allOrders);

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

  // Client-side filtering function
  const applyFilters = useCallback((orders, filterCriteria) => {
    return orders.filter((order) => {
      // Status filter
      if (filterCriteria.status && order.status !== filterCriteria.status) {
        return false;
      }

      // Payment status filter
      if (
        filterCriteria.paymentStatus &&
        order.paymentStatus !== filterCriteria.paymentStatus
      ) {
        return false;
      }

      // Search filter (order number, email, phone, name)
      if (filterCriteria.search && filterCriteria.search.trim()) {
        const searchTerm = filterCriteria.search.toLowerCase();
        const orderNumber = (order.orderNumber || `#${order.id}`).toLowerCase();
        const contactEmail = (order.contactEmail || "").toLowerCase();
        const contactPhone = (order.contactPhone || "").toLowerCase();
        const customerName = `${order.shippingFirstName || ""} ${
          order.shippingLastName || ""
        }`.toLowerCase();

        const matchesSearch =
          orderNumber.includes(searchTerm) ||
          contactEmail.includes(searchTerm) ||
          contactPhone.includes(searchTerm) ||
          customerName.includes(searchTerm);

        if (!matchesSearch) return false;
      }

      // Date filters
      if (filterCriteria.dateFrom) {
        const orderDate = new Date(order.createdAt);
        const fromDate = new Date(filterCriteria.dateFrom);
        if (orderDate < fromDate) return false;
      }

      if (filterCriteria.dateTo) {
        const orderDate = new Date(order.createdAt);
        const toDate = new Date(filterCriteria.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (orderDate > toDate) return false;
      }

      return true;
    });
  }, []);

  // Client-side pagination function
  const applyPagination = useCallback((orders, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    return {
      orders: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(orders.length / limit),
        totalOrders: orders.length,
        limit: limit,
      },
    };
  }, []);

  // Update filtered and paginated orders when filters or page changes
  const updateDisplayedOrders = useCallback(() => {
    console.log("� Updating displayed orders with filters:", filters);

    // Apply filters
    const filtered = applyFilters(allOrders, filters);
    setFilteredOrders(filtered);

    // Apply pagination
    const paginated = applyPagination(
      filtered,
      pagination.currentPage,
      pagination.limit
    );
    setDisplayedOrders(paginated.orders);
    setPagination(paginated.pagination);

    console.log(
      `📊 Filtered ${filtered.length} orders from ${allOrders.length} total`
    );
  }, [
    allOrders,
    filters,
    pagination.currentPage,
    pagination.limit,
    applyFilters,
    applyPagination,
  ]);

  // Fetch all orders once (only called on mount or refresh)
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📡 Fetching all orders from server...");

      // Fetch all orders without pagination (or with large limit)
      const response = await axiosInstance.get(
        "/admin/orders?limit=1000&page=1"
      );
      console.log("📦 Orders API response:", response.data);

      if (response.data && response.data.success) {
        const { orders: fetchedOrders } = response.data.data;
        console.log(`✅ Fetched ${fetchedOrders?.length || 0} total orders`);

        setAllOrders(fetchedOrders || []);
      } else {
        throw new Error(response.data?.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("❌ Fetch orders error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch orders";
      setError(errorMessage);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders on component mount
  useEffect(() => {
    console.log("🚀 OrdersPage mounted - calling fetchAllOrders");
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Update displayed orders when filters or allOrders change
  useEffect(() => {
    if (allOrders.length > 0) {
      updateDisplayedOrders();
    }
  }, [allOrders, filters, updateDisplayedOrders]);

  // Handle status update
  const handleStatusUpdate = (orderId, updates) => {
    console.log("🔄 Updating order status:", orderId, updates);
    setAllOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

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
    console.log("🔄 Refreshing orders");
    fetchAllOrders();
  };

  // Handle export
  const handleExport = (format = "csv") => {
    console.log("📊 Exporting orders as", format);

    try {
      // Use filtered orders for export (respects current filters)
      const ordersToExport =
        filteredOrders.length > 0 ? filteredOrders : allOrders;

      if (ordersToExport.length === 0) {
        alert("No orders to export!");
        return;
      }

      // Show loading state briefly
      setLoading(true);

      // Prepare data for export
      const exportData = ordersToExport.map((order) => ({
        "Order ID": order.id,
        "Order Number": order.orderNumber || "N/A",
        "Customer Name":
          order.shippingFirstName && order.shippingLastName
            ? `${order.shippingFirstName} ${order.shippingLastName}`
            : "N/A",
        Email: order.contactEmail || "N/A",
        Phone: order.contactPhone || "N/A",
        "Total Amount": `₹${
          order.totalAmount ? parseFloat(order.totalAmount).toFixed(2) : "0.00"
        }`,
        Subtotal: `₹${
          order.subtotal ? parseFloat(order.subtotal).toFixed(2) : "0.00"
        }`,
        "Shipping Cost": `₹${
          order.shippingCost
            ? parseFloat(order.shippingCost).toFixed(2)
            : "0.00"
        }`,
        "Tax Amount": `₹${
          order.taxAmount ? parseFloat(order.taxAmount).toFixed(2) : "0.00"
        }`,
        Status: order.status || "N/A",
        "Payment Status": order.paymentStatus || "N/A",
        "Payment Method": order.paymentMethod || "N/A",
        "Shipping Address": order.shippingAddress
          ? `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} ${order.shippingPincode}`
          : "N/A",
        "Order Date": order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "N/A",
        "Updated Date": order.updatedAt
          ? new Date(order.updatedAt).toLocaleDateString()
          : "N/A",
        "Items Count": order.products
          ? order.products.length
          : order.orderProducts
          ? order.orderProducts.length
          : 0,
        Items: order.products
          ? order.products
              .map(
                (item) =>
                  `${item.productName || "Unknown"} (x${item.quantity}) - ₹${
                    item.unitPrice
                      ? parseFloat(item.unitPrice).toFixed(2)
                      : "0.00"
                  }`
              )
              .join("; ")
          : order.orderProducts
          ? order.orderProducts
              .map(
                (item) =>
                  `${item.productName || item.Product?.name || "Unknown"} (x${
                    item.quantity
                  }) - ₹${
                    item.unitPrice
                      ? parseFloat(item.unitPrice).toFixed(2)
                      : "0.00"
                  }`
              )
              .join("; ")
          : "N/A",
        "Order Notes": order.orderNotes || "N/A",
        "Tracking Number": order.trackingNumber || "N/A",
        Carrier: order.carrier || "N/A",
      }));

      // Add a small delay to show loading state
      setTimeout(() => {
        try {
          if (format === "csv") {
            exportToCSV(
              exportData,
              `orders_export_${new Date().toISOString().split("T")[0]}.csv`
            );
          } else if (format === "excel") {
            exportToExcel(
              exportData,
              `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`
            );
          }

          // Show success message
          alert(
            `Successfully exported ${
              ordersToExport.length
            } orders as ${format.toUpperCase()}!`
          );
        } catch (exportError) {
          console.error("Export error:", exportError);
          alert("Failed to export orders. Please try again.");
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

  // Export to CSV function
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
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
        { wch: 12 }, // Order ID
        { wch: 15 }, // Order Number
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 12 }, // Total Amount
        { wch: 10 }, // Subtotal
        { wch: 10 }, // Shipping Cost
        { wch: 10 }, // Tax Amount
        { wch: 12 }, // Status
        { wch: 15 }, // Payment Status
        { wch: 15 }, // Payment Method
        { wch: 35 }, // Shipping Address
        { wch: 12 }, // Order Date
        { wch: 12 }, // Updated Date
        { wch: 10 }, // Items Count
        { wch: 60 }, // Items
        { wch: 30 }, // Order Notes
        { wch: 15 }, // Tracking Number
        { wch: 15 }, // Carrier
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

      XLSX.utils.book_append_sheet(wb, ws, "Orders Export");

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
    fetchAllOrders();
  };

  console.log("🎨 Rendering OrdersPage with:", {
    ordersCount: displayedOrders.length,
    totalOrders: filteredOrders.length,
    allOrdersCount: allOrders.length,
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
          filteredCount={filteredOrders.length}
          totalCount={allOrders.length}
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
          orderStats={orderStats}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={displayedOrders}
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
