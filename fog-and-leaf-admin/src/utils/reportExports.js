import * as XLSX from "xlsx";

// Export utilities for reports
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const csvContent = convertToCSV(data);
  downloadFile(csvContent, `${filename}.csv`, "text/csv");
};

export const exportToExcel = (data, filename, sheetName = "Report") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Auto-resize columns
  const cols = Object.keys(data[0]).map((key) => ({
    wch:
      Math.max(
        key.length,
        ...data.map((row) => String(row[key] || "").length)
      ) + 2,
  }));
  worksheet["!cols"] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportMultiSheetExcel = (sheets, filename) => {
  if (!sheets || Object.keys(sheets).length === 0) {
    alert("No data to export");
    return;
  }

  const workbook = XLSX.utils.book_new();

  Object.entries(sheets).forEach(([sheetName, data]) => {
    if (data && data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-resize columns
      const cols = Object.keys(data[0]).map((key) => ({
        wch:
          Math.max(
            key.length,
            ...data.map((row) => String(row[key] || "").length)
          ) + 2,
      }));
      worksheet["!cols"] = cols;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Convert array of objects to CSV string
const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";

      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

// Download file helper
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Format data for different report types
export const formatSalesData = (salesData) => {
  return salesData.map((item) => ({
    Date: new Date(item.date).toLocaleDateString(),
    "Revenue (₹)": item.revenue?.toFixed(2) || "0.00",
    Orders: item.orders || 0,
    "Average Order Value (₹)": item.avgOrderValue?.toFixed(2) || "0.00",
  }));
};

export const formatProductData = (productData) => {
  return productData.map((product) => ({
    "Product Name": product.name || "",
    Category: product.category || "",
    "Price (₹)": product.price?.toFixed(2) || "0.00",
    "Stock Quantity": product.stockQuantity || 0,
    "Revenue (₹)": product.revenue?.toFixed(2) || "0.00",
    "Units Sold": product.unitsSold || 0,
    Rating: product.rating?.toFixed(1) || "0.0",
    "Review Count": product.reviewCount || 0,
  }));
};

export const formatInventoryData = (inventoryData) => {
  return inventoryData.map((item) => ({
    "Product Name": item.name || "",
    Category: item.category || "",
    "Current Stock": item.stockQuantity || 0,
    "Stock Status": item.stockStatus || "",
    "Reorder Level": item.reorderLevel || 0,
    "Last Restocked": item.lastRestocked
      ? new Date(item.lastRestocked).toLocaleDateString()
      : "Never",
    "Stock Value (₹)": item.stockValue?.toFixed(2) || "0.00",
  }));
};

export const formatCustomerData = (customerData) => {
  return customerData.map((customer) => ({
    "Customer Name": `${customer.firstname || ""} ${
      customer.lastname || ""
    }`.trim(),
    Email: customer.email || "",
    "Total Orders": customer.orderCount || 0,
    "Total Spent (₹)": customer.totalSpent?.toFixed(2) || "0.00",
    "Average Order Value (₹)": customer.avgOrderValue?.toFixed(2) || "0.00",
    "Last Order Date": customer.lastOrderDate
      ? new Date(customer.lastOrderDate).toLocaleDateString()
      : "Never",
    "Customer Since": customer.createdAt
      ? new Date(customer.createdAt).toLocaleDateString()
      : "",
  }));
};

// Generate comprehensive report data
export const generateComprehensiveReport = (reportsData) => {
  const { overview, sales, products, inventory, customers } = reportsData;

  const sheets = {};

  // Overview sheet
  if (overview) {
    sheets["Overview"] = [
      {
        Metric: "Total Revenue",
        Value: `₹${overview.totalRevenue?.toFixed(2) || "0.00"}`,
      },
      { Metric: "Total Orders", Value: overview.totalOrders || 0 },
      { Metric: "Total Customers", Value: overview.totalCustomers || 0 },
      {
        Metric: "Average Order Value",
        Value: `₹${overview.avgOrderValue?.toFixed(2) || "0.00"}`,
      },
      { Metric: "Pending Orders", Value: overview.pendingOrders || 0 },
      { Metric: "Low Stock Items", Value: overview.lowStockItems || 0 },
    ];
  }

  // Sales sheet
  if (sales && sales.length > 0) {
    sheets["Sales"] = formatSalesData(sales);
  }

  // Products sheet
  if (products && products.length > 0) {
    sheets["Products"] = formatProductData(products);
  }

  // Inventory sheet
  if (inventory && inventory.length > 0) {
    sheets["Inventory"] = formatInventoryData(inventory);
  }

  // Customers sheet
  if (customers && customers.length > 0) {
    sheets["Customers"] = formatCustomerData(customers);
  }

  return sheets;
};
