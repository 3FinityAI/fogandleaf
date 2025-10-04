import { useState } from "react";
import {
  X,
  Package,
  Save,
  Plus,
  Minus,
  History,
  BarChart3,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const InventoryManagementModal = ({ item, mode, onClose, onSave }) => {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "history") return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        productId: item.id,
        quantity: parseInt(quantity),
        reason,
        type: mode,
      };

      await axiosInstance.post("/admin/inventory/movement", payload);
      onSave();
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "add":
        return "Add Stock";
      case "remove":
        return "Remove Stock";
      case "adjust":
        return "Adjust Stock";
      case "history":
        return "Stock History";
      default:
        return "Stock Management";
    }
  };

  const getIcon = () => {
    switch (mode) {
      case "add":
        return <Plus className="h-5 w-5" />;
      case "remove":
        return <Minus className="h-5 w-5" />;
      case "adjust":
        return <BarChart3 className="h-5 w-5" />;
      case "history":
        return <History className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Product Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">
              {item?.productName || item?.name}
            </h3>
            <p className="text-sm text-gray-500">SKU: {item?.sku}</p>
            <p className="text-sm text-gray-500">
              Current Stock: {item?.currentStock || item?.stock}
            </p>
          </div>

          {mode === "history" ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Recent Stock Movements
              </h4>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((movement, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{movement.type}</p>
                          <p className="text-sm text-gray-500">
                            {movement.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {movement.type === "add" ? "+" : "-"}
                            {movement.quantity}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(movement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No stock movements found
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select reason</option>
                  <option value="purchase">Purchase</option>
                  <option value="return">Return</option>
                  <option value="damaged">Damaged</option>
                  <option value="sold">Sold</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {mode === "history" ? "Close" : "Cancel"}
          </button>

          {mode !== "history" && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagementModal;
