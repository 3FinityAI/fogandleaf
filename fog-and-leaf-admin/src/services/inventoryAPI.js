import api from "../utils/axiosInstance";

export const inventoryAPI = {
  // Get inventory overview with stats and alerts
  getOverview: async () => {
    const response = await api.get("/inventory/overview");
    return response.data;
  },

  // Update stock for a specific product
  updateStock: async (productId, data) => {
    const response = await api.put(`/inventory/stock/${productId}`, data);
    return response.data;
  },

  // Bulk update stock for multiple products
  bulkUpdateStock: async (updates) => {
    const response = await api.put("/inventory/stock/bulk", { updates });
    return response.data;
  },

  // Get stock movement history
  getStockHistory: async (params = {}) => {
    const response = await api.get("/inventory/history", { params });
    return response.data;
  },

  // Set reorder points for products
  setReorderPoints: async (reorderPoints) => {
    const response = await api.put("/inventory/reorder-points", {
      reorderPoints,
    });
    return response.data;
  },

  // Generate inventory report
  generateReport: async (format = "json", includeHistory = false) => {
    const response = await api.get("/inventory/report", {
      params: { format, includeHistory },
    });
    return response.data;
  },

  // Download CSV report
  downloadCSV: async () => {
    const response = await api.get("/inventory/report", {
      params: { format: "csv" },
      responseType: "blob",
    });

    // Create blob link to download CSV
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: "Report downloaded successfully" };
  },
};

export default inventoryAPI;
