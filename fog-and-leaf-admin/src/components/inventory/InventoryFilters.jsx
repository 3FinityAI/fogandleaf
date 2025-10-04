import { Search, Filter, RotateCcw } from "lucide-react";

const InventoryFilters = ({ filters, onFilterChange }) => {
  const handleFilterUpdate = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      stockStatus: "",
      category: "",
      movement: "",
      dateRange: { start: "", end: "" },
      search: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={filters.search}
            onChange={(e) => handleFilterUpdate("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Stock Status Filter */}
        <select
          value={filters.stockStatus}
          onChange={(e) => handleFilterUpdate("stockStatus", e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterUpdate("category", e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="clothing">Clothing</option>
          <option value="accessories">Accessories</option>
          <option value="shoes">Shoes</option>
        </select>

        {/* Movement Type */}
        <select
          value={filters.movement}
          onChange={(e) => handleFilterUpdate("movement", e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Movements</option>
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
          <option value="adjustment">Adjustment</option>
        </select>

        {/* Date Range */}
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) =>
              handleFilterUpdate("dateRange", {
                ...filters.dateRange,
                start: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) =>
              handleFilterUpdate("dateRange", {
                ...filters.dateRange,
                end: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
