import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";
import {
  Search,
  Filter,
  Eye,
  Package,
  CheckCircle,
  Clock,
  Truck,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Save,
  Download,
  RefreshCw,
  Check,
  Square,
  CheckSquare,
  Archive,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const statusIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: null,
  };

  const Icon = statusIcons[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderFilters = ({ filters, onFilterChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-8 mb-8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📋 Order Management & Filters
        </h3>
        <p className="text-sm text-gray-600">
          Search, filter, and manage all customer orders efficiently
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            🔍 Search Orders
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search orders, customers, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-12 py-3 border-2 border-secondary-300 rounded-xl 
                         bg-white text-secondary-900 placeholder-secondary-500 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         hover:border-secondary-400 transition-all duration-200 text-sm"
              />
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-gray-700">
            📊 Quick Filters
          </label>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ ...filters, status: e.target.value })
              }
              className="appearance-none bg-white border-2 border-secondary-300 rounded-lg px-4 py-2.5 pr-10
                       text-sm font-medium text-secondary-700 hover:border-secondary-400 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       transition-all duration-200 w-full"
            >
              <option value="">All Status</option>
              <option value="pending">🕒 Pending</option>
              <option value="processing">📦 Processing</option>
              <option value="shipped">🚚 Shipped</option>
              <option value="delivered">✅ Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const BulkActionsToolbar = ({
  selectedOrders,
  onSelectAll,
  onClearSelection,
}) => {
  if (selectedOrders.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-blue-700 font-medium">
          {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""}{" "}
          selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-gray-600 hover:text-gray-800 text-sm underline"
        >
          Clear selection
        </button>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    search: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/orders");
      setOrders(response.data || []);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleClearSelection = () => {
    setSelectedOrders([]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading orders...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <OrderFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        <BulkActionsToolbar
          selectedOrders={selectedOrders}
          onClearSelection={handleClearSelection}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(orders.map((order) => order.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </th>
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer_email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status || "pending"} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total_amount || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
