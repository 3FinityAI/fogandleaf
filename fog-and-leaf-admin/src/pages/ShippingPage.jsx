import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";
import {
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit3,
  RefreshCw,
  Search,
} from "lucide-react";

// Inline StatusBadge component (copied from OrdersPageClean.jsx pattern)
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

// Status Cards Component
const ShippingStatusCards = ({ orders }) => {
  const stats = {
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    total: orders.length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-yellow-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Processing</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.processing}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
        <div className="flex items-center">
          <Truck className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Shipped</p>
            <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Delivered</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.delivered}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Search and Filter
const ShippingFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              placeholder="Search by Order ID or Customer Email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({ ...filters, status: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>

        <button
          onClick={() => onFilterChange({ status: "", search: "" })}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

const ShippingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  // Simple fetch function like OrdersPageClean.jsx
  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Fetching shipping orders...");
      // Simple API call like Orders - no complex parameters
      const response = await axiosInstance.get("/admin/shipping");
      console.log("Shipping API Response:", response.data);

      if (response.data.success) {
        const ordersData = response.data.data?.shipments || [];
        console.log("Shipping orders received:", ordersData.length, ordersData);

        // Log first order to check field names
        if (ordersData.length > 0) {
          console.log("Sample order fields:", Object.keys(ordersData[0]));
          console.log("Sample order data:", ordersData[0]);
        }

        setOrders(ordersData);
      } else {
        setError(response.data.message || "Failed to fetch shipping orders");
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching shipping orders:", err);
      console.error("Error response:", err.response?.data);
      setError(
        `Error loading shipping orders: ${
          err.response?.data?.message || err.message
        }`
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on current filters (client-side like Orders)
  const filteredOrders = orders.filter((order) => {
    if (filters.status && order.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const orderIdMatch = order.id?.toString().includes(searchLower);
      const emailMatch = (
        order.contactEmail ||
        order.customer_email ||
        order.user?.email ||
        ""
      )
        .toLowerCase()
        .includes(searchLower);
      const orderNumberMatch = (order.orderNumber || "")
        .toLowerCase()
        .includes(searchLower);
      return orderIdMatch || emailMatch || orderNumberMatch;
    }
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading shipping orders...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Shipment Tracking
            </h1>
            <p className="text-gray-600">Track and manage order shipments</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <ShippingStatusCards orders={orders} />

        {/* Filters */}
        <ShippingFilters filters={filters} onFilterChange={setFilters} />

        {/* Shipment Tracking List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Shipment Orders ({filteredOrders.length})
            </h3>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No shipment orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.contactEmail ||
                          order.customer_email ||
                          (order.user ? order.user.email : "N/A")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status || "pending"} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.totalAmount || order.total_amount || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 text-gray-400 mr-2" />
                          {order.trackingNumber ||
                            order.tracking_number ||
                            order.orderNumber ||
                            `FOG${order.id}` ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt || order.created_at
                          ? new Date(
                              order.createdAt || order.created_at
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Tracking Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="Update Shipment"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPage;
