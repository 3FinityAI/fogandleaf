// Dashboard utility functions to keep components clean and reusable

/**
 * Format currency values consistently
 */
export const formatCurrency = (value) => {
  if (!value || isNaN(value)) return "₹0";
  return `₹${Number(value).toLocaleString("en-IN")}`;
};

/**
 * Format numbers with consistent locale formatting
 */
export const formatNumber = (value) => {
  if (!value || isNaN(value)) return "0";
  return Number(value).toLocaleString();
};

/**
 * Format dates consistently across the dashboard
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Get status badge styles for orders
 */
export const getOrderStatusStyle = (status) => {
  const styles = {
    delivered: "bg-green-100 text-green-800",
    shipped: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    pending: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

/**
 * Get color classes for stat cards
 */
export const getStatCardColors = (color) => {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-600 border-primary-200",
    green: "bg-green-50 text-green-600 border-green-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return colorClasses[color] || colorClasses.primary;
};

/**
 * Generate alerts based on dashboard data
 */
export const generateAlerts = (stats) => {
  const alerts = [];

  if (stats.pendingOrders > 0) {
    alerts.push({
      type: "warning",
      message: `${stats.pendingOrders} pending orders need attention`,
      action: "View Orders",
      link: "/orders",
    });
  }

  if (stats.lowStockProducts > 0) {
    alerts.push({
      type: "warning",
      message: `${stats.lowStockProducts} products have low stock`,
      action: "Manage Inventory",
      link: "/products",
    });
  }

  if (stats.outOfStockProducts > 0) {
    alerts.push({
      type: "error",
      message: `${stats.outOfStockProducts} products are out of stock`,
      action: "Restock Now",
      link: "/products",
    });
  }

  return alerts;
};

/**
 * Get trend direction and color for statistics
 */
export const getTrendInfo = (current, previous) => {
  if (!previous || previous === 0)
    return { trend: "neutral", color: "text-secondary-600" };

  const change = ((current - previous) / previous) * 100;

  if (change > 0) {
    return {
      trend: "up",
      color: "text-green-600",
      percentage: `+${change.toFixed(1)}%`,
    };
  } else if (change < 0) {
    return {
      trend: "down",
      color: "text-red-600",
      percentage: `${change.toFixed(1)}%`,
    };
  }

  return { trend: "neutral", color: "text-secondary-600", percentage: "0%" };
};

/**
 * Quick action items for dashboard
 */
export const getQuickActions = () => [
  { icon: "Eye", label: "View All Orders", link: "/orders" },
  { icon: "Package", label: "Manage Products", link: "/products" },
  { icon: "Users", label: "Customer Reports", link: "/reports" },
  { icon: "BarChart3", label: "Analytics", link: "/reports" },
];

/**
 * Safely get nested object values
 */
export const safeGet = (obj, path, defaultValue = null) => {
  return (
    path.split(".").reduce((current, key) => current?.[key], obj) ??
    defaultValue
  );
};
