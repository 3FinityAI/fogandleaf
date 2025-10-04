import { RefreshCw, Download, Package } from "lucide-react";

const ShippingHeader = ({ onRefresh, onExport, loading }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-600" />
          Shipping Management
        </h1>
        <p className="text-gray-600 mt-1">
          Track and manage all shipments, delivery status, and carrier
          information
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
};

export default ShippingHeader;
