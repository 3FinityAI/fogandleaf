import { RefreshCw, Download, ChevronDown } from "lucide-react";
import { useState } from "react";

const OrdersHeader = ({
  onRefresh,
  onExport,
  loading,
  filteredCount,
  totalCount,
}) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleExportOption = (format) => {
    onExport(format);
    setShowExportDropdown(false);
  };

  const exportCount = filteredCount > 0 ? filteredCount : totalCount;

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-1">
          Manage customer orders, update status and track payments
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="w-4 h-4" />
          </button>

          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button
                  onClick={() => handleExportOption("csv")}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExportOption("excel")}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as Excel
                </button>
              </div>
              <div className="border-t border-gray-200 px-4 py-2">
                <p className="text-xs text-gray-500">
                  Will export {exportCount || 0} order
                  {exportCount !== 1 ? "s" : ""}
                  {filteredCount > 0 ? " (filtered)" : " (all)"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showExportDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportDropdown(false)}
        />
      )}
    </div>
  );
};

export default OrdersHeader;
