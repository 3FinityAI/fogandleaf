import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

const InventoryStats = ({ stats, loading }) => {
  const statItems = [
    {
      name: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      name: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-100",
    },
    {
      name: "Out of Stock",
      value: stats.outOfStock,
      icon: TrendingDown,
      color: "text-red-600 bg-red-100",
    },
    {
      name: "Total Value",
      value: `$${stats.totalValue?.toLocaleString() || 0}`,
      icon: BarChart3,
      color: "text-green-600 bg-green-100",
    },
    {
      name: "Stock Movements",
      value: stats.recentMovements,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "..." : item.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryStats;
