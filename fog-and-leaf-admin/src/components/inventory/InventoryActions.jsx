import {
  Plus,
  FileDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

const InventoryActions = ({ selectedItems, onExport, onStockMovement }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Actions</h3>
          {selectedItems.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedItems.length} items selected
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onStockMovement("add")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Add Stock
          </button>

          <button
            onClick={() => onStockMovement("remove")}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <TrendingDown className="h-4 w-4" />
            Remove Stock
          </button>

          <button
            onClick={() => onStockMovement("report")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Stock Report
          </button>

          <div className="flex gap-2">
            <button
              onClick={onExport.csv}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              CSV
            </button>

            <button
              onClick={onExport.excel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {selectedItems.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">
          Manage stock levels and update inventory using the actions above.
        </p>
      )}
    </div>
  );
};

export default InventoryActions;
