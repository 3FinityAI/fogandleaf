import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Eye,
  Star,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const ProductPerformanceTable = ({
  products,
  title = "Top Performing Products",
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {title}
        </h3>
        <div className="text-center py-12 text-secondary-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No product data available</p>
          <p className="text-sm">
            Sales data will appear here once orders are placed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {title}
        </h3>
        <div className="text-sm text-secondary-600">
          Showing top {products.length} products
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Rank
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Product
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Sales
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Revenue
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Rating
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Stock
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const salesCount = parseInt(
                product.salesCount || product.dataValues?.salesCount || 0
              );
              const totalRevenue = parseFloat(
                product.totalRevenue || product.dataValues?.totalRevenue || 0
              );
              const rating = parseFloat(product.rating || 0);
              const stockQuantity = parseInt(product.stockQuantity || 0);
              const reviewCount = parseInt(product.reviewCount || 0);

              // Determine stock status
              const stockStatus =
                stockQuantity === 0
                  ? { color: "text-red-600 bg-red-100", text: "Out of Stock" }
                  : stockQuantity <= 10
                  ? {
                      color: "text-yellow-600 bg-yellow-100",
                      text: "Low Stock",
                    }
                  : { color: "text-green-600 bg-green-100", text: "In Stock" };

              return (
                <tr
                  key={product.id}
                  className="table-row hover:bg-secondary-50"
                >
                  {/* Rank */}
                  <td className="py-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-100">
                      <span className="text-sm font-bold text-secondary-700">
                        #{index + 1}
                      </span>
                    </div>
                  </td>

                  {/* Product Info */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-secondary-500" />
                      </div>
                      <div>
                        <div className="font-medium text-secondary-900 line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-xs text-secondary-500">
                          ${parseFloat(product.price || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Sales */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">{salesCount}</div>
                        <div className="text-xs text-secondary-500">
                          {parseInt(
                            product.totalQuantitySold ||
                              product.dataValues?.totalQuantitySold ||
                              0
                          )}{" "}
                          units
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">
                          ${totalRevenue.toFixed(2)}
                        </div>
                        <div className="text-xs text-secondary-500">
                          $
                          {salesCount > 0
                            ? (totalRevenue / salesCount).toFixed(2)
                            : "0.00"}{" "}
                          avg
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-secondary-500">
                        ({reviewCount} reviews)
                      </div>
                    </div>
                  </td>

                  {/* Stock Status */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                      >
                        {stockQuantity}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {stockStatus.text}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-secondary-900">
              {products.reduce(
                (sum, p) =>
                  sum + parseInt(p.salesCount || p.dataValues?.salesCount || 0),
                0
              )}
            </div>
            <div className="text-xs text-secondary-600">Total Sales</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              $
              {products
                .reduce(
                  (sum, p) =>
                    sum +
                    parseFloat(
                      p.totalRevenue || p.dataValues?.totalRevenue || 0
                    ),
                  0
                )
                .toFixed(2)}
            </div>
            <div className="text-xs text-secondary-600">Total Revenue</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {(
                products.reduce(
                  (sum, p) => sum + parseFloat(p.rating || 0),
                  0
                ) / products.length
              ).toFixed(1)}
            </div>
            <div className="text-xs text-secondary-600">Avg Rating</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {products.reduce(
                (sum, p) => sum + parseInt(p.stockQuantity || 0),
                0
              )}
            </div>
            <div className="text-xs text-secondary-600">Total Stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceTable;
