import { Package, Truck, Clock, CheckCircle, XCircle } from "lucide-react";

const ShippingStats = ({ stats, loading }) => {
  const statItems = [
    {
      name: "Total Shipments",
      value: stats.total,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      name: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      name: "In Transit",
      value: stats.inTransit,
      icon: Truck,
      color: "text-orange-600 bg-orange-100",
    },
    {
      name: "Delivered",
      value: stats.delivered,
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
    },
    {
      name: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-red-600 bg-red-100",
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

export default ShippingStats;
