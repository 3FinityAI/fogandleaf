import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Package,
  Trash2,
} from "lucide-react";

const ProductStatusBadge = ({ isActive }) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${
        isActive
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-red-100 text-red-800 border-red-200"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const StockBadge = ({
  stock,
  lowStockThreshold = 10,
  showLabel = true,
  showCount = true,
}) => {
  const getStockStatus = () => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        shortLabel: "Out of Stock",
        color: "bg-amber-50 text-amber-700 border border-amber-200 opacity-75",
      };
    if (stock <= lowStockThreshold)
      return {
        label: "Low Stock",
        shortLabel: "Low Stock",
        color: "bg-orange-100 text-orange-800 border border-orange-200",
      };
    return {
      label: "In Stock",
      shortLabel: "In Stock",
      color: "bg-green-100 text-green-800 border border-green-200",
    };
  };

  const { label, shortLabel, color } = getStockStatus();

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {showLabel
        ? showCount
          ? `${label} (${stock})`
          : label
        : showCount
        ? `${shortLabel} (${stock})`
        : shortLabel}
    </span>
  );
};

const ProductTable = ({
  products,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            Get started by adding your first product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="space-y-3 p-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${
                product.stockQuantity === 0
                  ? "border-amber-200 bg-amber-50/30"
                  : product.stockQuantity <= 10
                  ? "border-orange-200 bg-orange-50/20"
                  : "border-gray-200"
              }`}
            >
              {/* Header with Image, Name and Actions */}
              <div className="flex items-start justify-between p-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-12 w-12">
                    {product.imageUrl && product.imageUrl[0] ? (
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={product.imageUrl[0]}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "/api/placeholder/48/48";
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1 capitalize">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-green-600">
                        ₹{product.price}
                      </span>
                      <ProductStatusBadge isActive={product.isActive} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <StockBadge
                        stock={product.stockQuantity}
                        showLabel={false}
                        showCount={false}
                      />
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        <span className="text-xs font-medium text-gray-700">
                          {product.rating || "N/A"}
                        </span>
                        <span className="text-yellow-500 text-xs">★</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Always Visible */}
                <div className="flex flex-col gap-2 ml-3 flex-shrink-0">
                  <button
                    onClick={() => onEdit(product)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                    title="Edit Product"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(product)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap"
                      title="Delete Product"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {product.imageUrl && product.imageUrl[0] ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.imageUrl[0]}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "/api/placeholder/40/40";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.weight}g
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.category?.charAt(0).toUpperCase() +
                      product.category
                        ?.slice(1)
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ₹{product.price}
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="ml-2 text-xs text-gray-500 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StockBadge stock={product.stockQuantity} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ProductStatusBadge isActive={product.isActive} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">
                      {product.rating || 0}★
                    </div>
                    <div className="text-xs text-gray-500 ml-1">
                      ({product.reviewCount || 0})
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      title="Edit Product - View Details & Update Information"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(product)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                        title="Delete Product - Remove from system"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
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
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page{" "}
                  <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
