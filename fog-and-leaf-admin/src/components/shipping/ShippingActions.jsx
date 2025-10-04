import { FileDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";

const ShippingActions = ({ selectedShipments, onBulkUpdate, onExport }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Actions</h3>
          {selectedShipments.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedShipments.length} items selected
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {selectedShipments.length > 0 && (
            <>
              <button
                onClick={() => onBulkUpdate("update_status")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Update Status
              </button>

              <button
                onClick={() => onBulkUpdate("cancel")}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Cancel Selected
              </button>
            </>
          )}

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

      {selectedShipments.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">
          Select shipments to perform bulk actions or use export options above.
        </p>
      )}
    </div>
  );
};

export default ShippingActions;
