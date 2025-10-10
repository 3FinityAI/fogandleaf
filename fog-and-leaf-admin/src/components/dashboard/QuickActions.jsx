import { useNavigate } from "react-router-dom";
import {
  Eye,
  Package,
  Users,
  BarChart3,
  ShoppingBag,
  Plus,
  Archive,
  Truck,
} from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Eye,
      label: "View All Orders",
      description: "Manage customer orders",
      path: "/orders",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    },
    {
      icon: Plus,
      label: "Add New Product",
      description: "Create product listing",
      path: "/products",
      color: "text-green-600 bg-green-50 hover:bg-green-100",
    },
    {
      icon: Package,
      label: "Manage Stock",
      description: "Adjust inventory levels",
      path: "/inventory",
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
    },
    {
      icon: ShoppingBag,
      label: "Confirmed Orders",
      description: "Orders awaiting processing",
      path: "/orders?status=confirmed",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    },
    {
      icon: Truck,
      label: "Shipping Management",
      description: "Track shipments",
      path: "/shipping",
      color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100",
    },
    {
      icon: Users,
      label: "Customer Management",
      description: "Manage user accounts",
      path: "/users",
      color: "text-teal-600 bg-teal-50 hover:bg-teal-100",
    },
    {
      icon: BarChart3,
      label: "Sales Reports",
      description: "Analytics & insights",
      path: "/reports",
      color: "text-rose-600 bg-rose-50 hover:bg-rose-100",
    },
    {
      icon: Archive,
      label: "Low Stock Alerts",
      description: "Products running low",
      path: "/inventory?filter=low-stock",
      color: "text-red-600 bg-red-50 hover:bg-red-100",
    },
  ];

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;

          return (
            <button
              key={index}
              onClick={() => handleActionClick(action.path)}
              className={`w-full flex items-center gap-4 p-3 text-left rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border border-transparent hover:border-gray-200 ${action.color}`}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {action.label}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to Dashboard Overview
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
