import {
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Eye,
  RefreshCw,
} from "lucide-react";

const InventoryStatusPanel = ({ inventory, title = "Inventory Status" }) => {
  if (!inventory) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          {title}
        </h3>
        <div className="text-center py-12 text-secondary-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No inventory data available</p>
        </div>
      </div>
    );
  }

  const {
    alerts = {},
    stockByCategory = [],
    recentStockMovements = [],
  } = inventory;
  const { lowStock = [], outOfStock = [] } = alerts;

  // Calculate total alerts
  const totalAlerts = lowStock.length + outOfStock.length;
  const criticalAlerts = outOfStock.length;
  const warningAlerts = lowStock.length;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Package className="w-5 h-5" />
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-secondary-400" />
            <span className="text-sm text-secondary-600">Live Status</span>
          </div>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <div className="text-lg font-bold text-red-900">
                  {criticalAlerts}
                </div>
                <div className="text-sm text-red-700">Out of Stock</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-lg font-bold text-yellow-900">
                  {warningAlerts}
                </div>
                <div className="text-sm text-yellow-700">Low Stock</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-900">
                  {Math.max(
                    0,
                    stockByCategory.reduce(
                      (sum, cat) =>
                        sum +
                        parseInt(
                          cat.productCount || cat.dataValues?.productCount || 0
                        ),
                      0
                    ) - totalAlerts
                  )}
                </div>
                <div className="text-sm text-green-700">Healthy Stock</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Alerts */}
        {totalAlerts > 0 ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-secondary-700">
              Immediate Attention Required
            </h4>

            {/* Out of Stock Alerts */}
            {outOfStock.map((product) => (
              <div
                key={`out-${product.id}`}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-red-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-red-700">
                      {product.category}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-red-800">
                  OUT OF STOCK
                </div>
              </div>
            ))}

            {/* Low Stock Alerts */}
            {lowStock.map((product) => (
              <div
                key={`low-${product.id}`}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <div>
                    <div className="text-sm font-medium text-yellow-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-yellow-700">
                      {product.category}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-yellow-800">
                  {product.stockQuantity} remaining
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-green-600">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">
              All products have healthy stock levels
            </p>
          </div>
        )}
      </div>

      {/* Stock by Category */}
      {stockByCategory && stockByCategory.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Stock by Category
          </h4>

          <div className="space-y-3">
            {stockByCategory.map((category, index) => {
              const productCount = parseInt(
                category.productCount || category.dataValues?.productCount || 0
              );
              const totalStock = parseInt(
                category.totalStock || category.dataValues?.totalStock || 0
              );
              const avgStock = parseFloat(
                category.avgStock || category.dataValues?.avgStock || 0
              );
              const categoryName =
                category.category || category.dataValues?.category || "Unknown";

              // Calculate percentage of total stock
              const totalAllStock = stockByCategory.reduce(
                (sum, cat) =>
                  sum +
                  parseInt(cat.totalStock || cat.dataValues?.totalStock || 0),
                0
              );
              const percentage =
                totalAllStock > 0 ? (totalStock / totalAllStock) * 100 : 0;

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-secondary-900">
                      {categoryName}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {percentage.toFixed(1)}% of total
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {productCount}
                      </div>
                      <div className="text-xs text-secondary-600">Products</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {totalStock}
                      </div>
                      <div className="text-xs text-secondary-600">
                        Total Stock
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {avgStock.toFixed(1)}
                      </div>
                      <div className="text-xs text-secondary-600">
                        Avg per Product
                      </div>
                    </div>
                  </div>

                  {/* Visual bar */}
                  <div className="mt-3 bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Stock Movements */}
      {recentStockMovements && recentStockMovements.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Stock Movements
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentStockMovements.slice(0, 10).map((movement, index) => {
              const quantity = parseInt(movement.quantity || 0);
              const isIncrease = movement.type === "increase" || quantity > 0;

              return (
                <div
                  key={movement.id || index}
                  className="flex items-center justify-between p-2 border rounded hover:bg-secondary-50"
                >
                  <div className="flex items-center gap-3">
                    {isIncrease ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {movement.product?.name || "Unknown Product"}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {movement.user?.firstname} {movement.user?.lastname} •
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-sm font-medium ${
                      isIncrease ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isIncrease ? "+" : ""}
                    {quantity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryStatusPanel;
