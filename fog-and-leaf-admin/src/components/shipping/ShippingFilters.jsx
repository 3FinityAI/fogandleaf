import { Search, Filter, X, Calendar } from "lucide-react";

const ShippingFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };

    // Handle date shortcuts
    if (key === "today") {
      newFilters.today = value;
      newFilters.thisWeek = false;
      newFilters.thisMonth = false;
      if (value) {
        const today = new Date().toISOString().split("T")[0];
        newFilters.dateFrom = today;
        newFilters.dateTo = today;
      } else {
        newFilters.dateFrom = "";
        newFilters.dateTo = "";
      }
    } else if (key === "thisWeek") {
      newFilters.thisWeek = value;
      newFilters.today = false;
      newFilters.thisMonth = false;
      if (value) {
        const today = new Date();
        const weekStart = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        const weekEnd = new Date(
          today.setDate(today.getDate() - today.getDay() + 6)
        );
        newFilters.dateFrom = weekStart.toISOString().split("T")[0];
        newFilters.dateTo = weekEnd.toISOString().split("T")[0];
      } else {
        newFilters.dateFrom = "";
        newFilters.dateTo = "";
      }
    } else if (key === "thisMonth") {
      newFilters.thisMonth = value;
      newFilters.today = false;
      newFilters.thisWeek = false;
      if (value) {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        newFilters.dateFrom = monthStart.toISOString().split("T")[0];
        newFilters.dateTo = monthEnd.toISOString().split("T")[0];
      } else {
        newFilters.dateFrom = "";
        newFilters.dateTo = "";
      }
    } else {
      newFilters[key] = value;
      // Clear date shortcuts when manually setting dates
      if (key === "dateFrom" || key === "dateTo") {
        newFilters.today = false;
        newFilters.thisWeek = false;
        newFilters.thisMonth = false;
      }
    }

    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== false
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">Filter Shipments</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, tracking, customer..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Shipping Status */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Shipping Statuses</option>
            <option value="shipped,delivered">Shipped & Delivered</option>
            <option value="shipped">Shipped Only</option>
            <option value="delivered">Delivered Only</option>
            <option value="cancelled">Cancelled/Returned</option>
            {/* Advanced filters for order preparation */}
            <option value="confirmed,processing">Ready to Ship</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Being Prepared</option>
          </select>
        </div>

        {/* Carrier */}
        <div>
          <select
            value={filters.carrier}
            onChange={(e) => handleFilterChange("carrier", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Carriers</option>
            <option value="dhl">DHL</option>
            <option value="fedex">FedEx</option>
            <option value="bluedart">Blue Dart</option>
            <option value="dtdc">DTDC</option>
            <option value="aramex">Aramex</option>
            <option value="indiapost">India Post</option>
            <option value="ekart">Ekart</option>
          </select>
        </div>

        {/* Date Shortcuts */}
        <div className="flex gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.today}
              onChange={(e) => handleFilterChange("today", e.target.checked)}
              className="mr-1"
            />
            <span className="text-sm text-gray-700">Today</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.thisWeek}
              onChange={(e) => handleFilterChange("thisWeek", e.target.checked)}
              className="mr-1"
            />
            <span className="text-sm text-gray-700">This Week</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.thisMonth}
              onChange={(e) =>
                handleFilterChange("thisMonth", e.target.checked)
              }
              className="mr-1"
            />
            <span className="text-sm text-gray-700">This Month</span>
          </label>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingFilters;
