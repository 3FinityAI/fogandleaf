import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  XCircle,
  IndianRupeeIcon,
} from "lucide-react";

const ProductStats = ({ stats, loading }) => {
  const statItems = [
    {
      name: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      name: "Active",
      value: stats?.activeProducts || 0,
      icon: Eye,
      color: "text-green-600 bg-green-100",
    },
    {
      name: "Low Stock",
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-100",
    },
    {
      name: "Out of Stock",
      value: stats?.outOfStockProducts || 0,
      icon: XCircle,
      color: "text-red-600 bg-red-100",
    },
    {
      name: "Inventory Value",
      value: `₹${Math.round(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupeeIcon,
      color: "text-green-600 bg-green-100",
    },
    // {
    //   name: "Avg Rating",
    //   value: stats?.averageRating || "0.0",
    //   icon: TrendingUp,
    //   color: "text-purple-600 bg-purple-100",
    // },
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

export default ProductStats;
