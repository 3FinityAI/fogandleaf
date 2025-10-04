import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";
import { exportToCSV, exportToExcel } from "../utils/exportUtils";
import { Truck, FileDown, RefreshCw, AlertCircle } from "lucide-react";

// Import modular shipping components
import ShippingStats from "../components/shipping/ShippingStats";
import ShippingFilters from "../components/shipping/ShippingFilters";
import ShippingTable from "../components/shipping/ShippingTable";
import ShippingActions from "../components/shipping/ShippingActions";

const ShippingPage = () => {
  // State management
  const [shippingData, setShippingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: "",
    carrier: "",
    dateRange: { start: "", end: "" },
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch shipping data
  const fetchShippingData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      });

      const response = await axiosInstance.get(`/admin/shipping?${params}`);

      if (response.data.success) {
        setShippingData(response.data.data.shipments || []);
        setStats(
          response.data.data.stats || {
            total: 0,
            pending: 0,
            inTransit: 0,
            delivered: 0,
            cancelled: 0,
          }
        );
        setTotalPages(
          Math.ceil((response.data.data.totalCount || 0) / itemsPerPage)
        );
      } else {
        setError("Failed to fetch shipping data");
      }
    } catch (error) {
      console.error("Error fetching shipping data:", error);
      setError(error.response?.data?.message || "Error fetching shipping data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchShippingData();
  }, [fetchShippingData]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchShippingData();
  };

  // Export functions
  const handleExportCSV = () => {
    const exportData = shippingData.map((shipment) => ({
      "Tracking ID": shipment.tracking_id,
      "Order ID": shipment.order_id,
      Status: shipment.status,
      Carrier: shipment.carrier,
      Customer: shipment.customer_name,
      Destination: shipment.destination,
      "Created Date": new Date(shipment.created_at).toLocaleDateString(),
      "Updated Date": new Date(shipment.updated_at).toLocaleDateString(),
    }));

    exportToCSV(
      exportData,
      `shipping-data-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleExportExcel = () => {
    const exportData = shippingData.map((shipment) => ({
      "Tracking ID": shipment.tracking_id,
      "Order ID": shipment.order_id,
      Status: shipment.status,
      Carrier: shipment.carrier,
      Customer: shipment.customer_name,
      Destination: shipment.destination,
      "Created Date": new Date(shipment.created_at).toLocaleDateString(),
      "Updated Date": new Date(shipment.updated_at).toLocaleDateString(),
    }));

    exportToExcel(
      [
        {
          sheetName: "Shipping Data",
          data: exportData,
        },
      ],
      `shipping-data-${new Date().toISOString().split("T")[0]}`
    );
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-600" />
                Shipping Management
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage shipments across multiple carriers
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Stats */}
        <ShippingStats stats={stats} loading={loading} />

        {/* Filters */}
        <ShippingFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* Shipping Table */}
        <ShippingTable
          shipments={shippingData}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh}
        />

        {/* Actions */}
        <ShippingActions
          selectedShipments={[]}
          onBulkUpdate={() => {}}
          onExport={{ csv: handleExportCSV, excel: handleExportExcel }}
        />
      </div>
    </Layout>
  );
};

export default ShippingPage;
