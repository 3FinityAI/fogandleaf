import { Plus, FileDown, Edit, Trash2 } from "lucide-react";

const ProductActions = ({
  selectedProducts,
  onBulkUpdate,
  onExport,
  onAddNew,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Actions</h3>
          {selectedProducts.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedProducts.length} items selected
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>

          {selectedProducts.length > 0 && (
            <>
              <button
                onClick={() => onBulkUpdate("update_status")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Update Status
              </button>

              <button
                onClick={() => onBulkUpdate("delete")}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
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

      {selectedProducts.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">
          Select products to perform bulk actions or use export options above.
        </p>
      )}
    </div>
  );
};

export default ProductActions;
