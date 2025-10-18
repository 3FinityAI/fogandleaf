import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LogOut,
  Menu,
  X,
  Leaf,
} from "lucide-react";

const Sidebar = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/orders", icon: ShoppingBag, label: "Orders" },
    { path: "/products", icon: Package, label: "Products" },
  ];

  return (
    <div
      className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Fog & Leaf</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Admin Panel</p>
              </div>
            </div>
          )}

          {/* Desktop collapse button / Mobile close button */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024 && onClose) {
                // On mobile, close the sidebar
                onClose();
              } else {
                // On desktop, toggle collapse
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={
              window.innerWidth < 1024
                ? "Close sidebar"
                : isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {window.innerWidth < 1024 ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : isCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <X className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navigationItems.map(({ path, icon: IconComponent, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => {
              // Close sidebar on mobile when navigation item is clicked
              if (window.innerWidth < 1024 && onClose) {
                onClose();
              }
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                isActive
                  ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${isCollapsed ? "justify-center" : ""}`
            }
          >
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed && (
          <div className="mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName || "Admin"} {user?.lastName || "User"}
                </p>
                <p className="text-xs text-green-600 font-medium truncate">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
