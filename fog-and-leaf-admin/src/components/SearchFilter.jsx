import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const SearchFilter = ({
  filters,
  onFilterChange,
  onSearch,
  placeholder = "Search...",
  searchHelp = null,
  filterOptions = [],
  hasActiveFilters = false,
  onClearFilters = null,
  children, // Additional filter controls
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchHelp, setShowSearchHelp] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Auto-search as user types (debounced)
    if (e.target.value === "") {
      onSearch("");
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className="card mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchHelp(!!searchHelp)}
              onBlur={() => setTimeout(() => setShowSearchHelp(false), 200)}
              className="block w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg 
                       bg-white text-secondary-900 placeholder-secondary-500 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       transition-colors duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  onSearch("");
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-secondary-400 hover:text-secondary-600" />
              </button>
            )}

            {/* Search Help Tooltip */}
            {showSearchHelp && searchTerm === "" && searchHelp && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg p-4">
                {searchHelp}
              </div>
            )}
          </div>
        </form>

        {/* Filter Controls */}
        <div className="flex gap-3">
          {/* Filter Options */}
          {filterOptions.map((option, index) => (
            <select
              key={index}
              value={filters[option.key] || ""}
              onChange={(e) =>
                onFilterChange({ ...filters, [option.key]: e.target.value })
              }
              className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2.5 pr-8 text-sm
                       font-medium text-secondary-700 hover:border-secondary-400 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       transition-colors duration-200"
              style={{ minWidth: option.minWidth || "auto" }}
            >
              <option value="">{option.allLabel}</option>
              {option.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* Additional custom controls */}
          {children}

          {/* Clear All Filters Button */}
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 
                       rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 
                       transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-secondary-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-secondary-700">
                Active Filters:
              </span>
              <div className="flex gap-2">
                {filterOptions.map((option) => {
                  const value = filters[option.key];
                  if (!value) return null;
                  return (
                    <span
                      key={option.key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-700"
                    >
                      {option.label}: {value}
                      <button
                        onClick={() =>
                          onFilterChange({ ...filters, [option.key]: "" })
                        }
                      >
                        <X className="h-3 w-3 hover:text-primary-900" />
                      </button>
                    </span>
                  );
                })}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-700">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        onSearch("");
                      }}
                    >
                      <X className="h-3 w-3 hover:text-primary-900" />
                    </button>
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-secondary-500">
              {Object.values(filters).filter((v) => v && v !== "").length +
                (searchTerm ? 1 : 0)}{" "}
              filters active
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
