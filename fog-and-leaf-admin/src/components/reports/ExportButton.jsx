import React, { useState } from "react";
import { Download, FileText, File, Files } from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportMultiSheetExcel,
  formatSalesData,
  formatProductData,
  formatInventoryData,
  formatCustomerData,
  generateComprehensiveReport,
} from "../../utils/reportExports";

const ExportButton = ({ reportsData, period }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (type, format) => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const periodLabel = period.replace(/([A-Z])/g, " $1").toLowerCase();

      switch (type) {
        case "overview":
          if (reportsData.overview) {
            const overviewData = [
              {
                Metric: "Total Revenue",
                Value: `₹${
                  reportsData.overview.totalRevenue?.toFixed(2) || "0.00"
                }`,
              },
              {
                Metric: "Total Orders",
                Value: reportsData.overview.totalOrders || 0,
              },
              {
                Metric: "Total Customers",
                Value: reportsData.overview.totalCustomers || 0,
              },
              {
                Metric: "Average Order Value",
                Value: `₹${
                  reportsData.overview.avgOrderValue?.toFixed(2) || "0.00"
                }`,
              },
              {
                Metric: "Pending Orders",
                Value: reportsData.overview.pendingOrders || 0,
              },
              {
                Metric: "Low Stock Items",
                Value: reportsData.overview.lowStockItems || 0,
              },
            ];

            if (format === "csv") {
              exportToCSV(overviewData, `overview-${periodLabel}-${timestamp}`);
            } else {
              exportToExcel(
                overviewData,
                `overview-${periodLabel}-${timestamp}`,
                "Overview"
              );
            }
          }
          break;

        case "sales":
          if (reportsData.sales?.length > 0) {
            const formattedData = formatSalesData(reportsData.sales);
            if (format === "csv") {
              exportToCSV(formattedData, `sales-${periodLabel}-${timestamp}`);
            } else {
              exportToExcel(
                formattedData,
                `sales-${periodLabel}-${timestamp}`,
                "Sales"
              );
            }
          }
          break;

        case "products":
          if (reportsData.products?.length > 0) {
            const formattedData = formatProductData(reportsData.products);
            if (format === "csv") {
              exportToCSV(
                formattedData,
                `products-${periodLabel}-${timestamp}`
              );
            } else {
              exportToExcel(
                formattedData,
                `products-${periodLabel}-${timestamp}`,
                "Products"
              );
            }
          }
          break;

        case "inventory":
          if (reportsData.inventory?.length > 0) {
            const formattedData = formatInventoryData(reportsData.inventory);
            if (format === "csv") {
              exportToCSV(
                formattedData,
                `inventory-${periodLabel}-${timestamp}`
              );
            } else {
              exportToExcel(
                formattedData,
                `inventory-${periodLabel}-${timestamp}`,
                "Inventory"
              );
            }
          }
          break;

        case "customers":
          if (reportsData.customers?.length > 0) {
            const formattedData = formatCustomerData(reportsData.customers);
            if (format === "csv") {
              exportToCSV(
                formattedData,
                `customers-${periodLabel}-${timestamp}`
              );
            } else {
              exportToExcel(
                formattedData,
                `customers-${periodLabel}-${timestamp}`,
                "Customers"
              );
            }
          }
          break;

        case "comprehensive": {
          const sheets = generateComprehensiveReport(reportsData);
          if (Object.keys(sheets).length > 0) {
            exportMultiSheetExcel(
              sheets,
              `comprehensive-report-${periodLabel}-${timestamp}`
            );
          }
          break;
        }

        default:
          console.error("Unknown export type:", type);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4 mr-2" />
        {isExporting ? "Exporting..." : "Export Reports"}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-700 mb-2 px-2">
              Export Individual Reports
            </div>

            {/* Overview */}
            <div className="mb-2">
              <div className="text-xs text-gray-600 px-2 mb-1">Overview</div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleExport("overview", "csv")}
                  className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  CSV
                </button>
                <button
                  onClick={() => handleExport("overview", "excel")}
                  className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                >
                  <File className="w-3 h-3 mr-1" />
                  Excel
                </button>
              </div>
            </div>

            {/* Sales */}
            {reportsData.sales?.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-600 px-2 mb-1">Sales</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExport("sales", "csv")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport("sales", "excel")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <File className="w-3 h-3 mr-1" />
                    Excel
                  </button>
                </div>
              </div>
            )}

            {/* Products */}
            {reportsData.products?.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-600 px-2 mb-1">Products</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExport("products", "csv")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport("products", "excel")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <File className="w-3 h-3 mr-1" />
                    Excel
                  </button>
                </div>
              </div>
            )}

            {/* Inventory */}
            {reportsData.inventory?.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-600 px-2 mb-1">Inventory</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExport("inventory", "csv")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport("inventory", "excel")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <File className="w-3 h-3 mr-1" />
                    Excel
                  </button>
                </div>
              </div>
            )}

            {/* Customers */}
            {reportsData.customers?.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-600 px-2 mb-1">Customers</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExport("customers", "csv")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport("customers", "excel")}
                    className="flex-1 text-xs px-2 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <File className="w-3 h-3 mr-1" />
                    Excel
                  </button>
                </div>
              </div>
            )}

            {/* Comprehensive Report */}
            <div className="border-t pt-2">
              <div className="text-xs font-medium text-gray-700 mb-2 px-2">
                Complete Report
              </div>
              <button
                onClick={() => handleExport("comprehensive", "excel")}
                className="w-full text-xs px-2 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center"
              >
                <Files className="w-3 h-3 mr-1" />
                Download All (Excel)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;
