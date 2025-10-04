import { Search, Filter, Calendar } from "lucide-react";

const OrderFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get date ranges
  const getDateRange = (type) => {
    const today = new Date();
    let startDate, endDate;

    switch (type) {
      case "today": {
        startDate = endDate = getTodayDate();
        break;
      }
      case "thisWeek": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startDate = startOfWeek.toISOString().split("T")[0];
        endDate = getTodayDate();
        break;
      }
      case "thisMonth": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = startOfMonth.toISOString().split("T")[0];
        endDate = getTodayDate();
        break;
      }
      default:
        return { startDate: "", endDate: "" };
    }

    return { startDate, endDate };
  };

  // Handle quick filter buttons
  const handleQuickFilter = (type) => {
    const { startDate, endDate } = getDateRange(type);
    onFiltersChange({
      ...filters,
      dateFrom: startDate,
      dateTo: endDate,
      today: type === "today",
      thisWeek: type === "thisWeek",
      thisMonth: type === "thisMonth",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClearFilters}
          className="ml-auto text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Orders
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="FOG number, email, phone..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Order Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e) =>
              onFiltersChange({ ...filters, paymentStatus: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Quick Date Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => handleQuickFilter("today")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filters.today
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleQuickFilter("thisWeek")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filters.thisWeek
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleQuickFilter("thisMonth")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filters.thisMonth
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateFrom: e.target.value,
                today: false,
                thisWeek: false,
                thisMonth: false,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateTo: e.target.value,
                today: false,
                thisWeek: false,
                thisMonth: false,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search ||
        filters.status ||
        filters.paymentStatus ||
        filters.dateFrom ||
        filters.dateTo) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              Active filters:
            </span>
            {filters.search && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: {filters.search}
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Status: {filters.status}
              </span>
            )}
            {filters.paymentStatus && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Payment: {filters.paymentStatus}
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Date: {filters.dateFrom || "..."} to {filters.dateTo || "..."}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;
