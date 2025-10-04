import { useState } from "react";
import { History, Edit3, Plus, Minus, Package } from "lucide-react";
import InventoryManagementModal from "./InventoryManagementModal";

const StockStatusBadge = ({ stock, lowStockThreshold = 10 }) => {
  const getStockStatus = () => {
    if (stock === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock <= lowStockThreshold)
      return { label: "Low Stock", color: "bg-orange-100 text-orange-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const { label, color } = getStockStatus();

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {label}
    </span>
  );
};

const InventoryTable = ({
  inventory,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onRefresh,
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [showModal, setShowModal] = useState(false);

  const handleAction = (item, action) => {
    setSelectedItem(item);
    setModalMode(action);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalMode("view");
  };

  const handleModalSave = () => {
    handleCloseModal();
    onRefresh();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No inventory items found
          </h3>
          <p className="text-gray-500">
            Inventory data will appear here once products are added.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Movement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName || item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      {item.currentStock || item.stock}
                    </div>
                    <div className="text-sm text-gray-500">
                      Min: {item.minStock || 10}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StockStatusBadge
                      stock={item.currentStock || item.stock}
                      lowStockThreshold={item.minStock || 10}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.lastMovementType || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.lastMovementDate
                        ? new Date(item.lastMovementDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      $
                      {(
                        (item.currentStock || item.stock) * (item.price || 0)
                      ).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAction(item, "adjust")}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Adjust Stock"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(item, "add")}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Add Stock"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(item, "remove")}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Remove Stock"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(item, "history")}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="View History"
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => onPageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          } ${page === 1 ? "rounded-l-md" : ""} ${
                            page === totalPages ? "rounded-r-md" : ""
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Management Modal */}
      {showModal && (
        <InventoryManagementModal
          item={selectedItem}
          mode={modalMode}
          onClose={handleCloseModal}
          onSave={handleModalSave}
        />
      )}
    </>
  );
};

export default InventoryTable;
