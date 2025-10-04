import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Layout from "../components/Layout";
import SalesPerformanceChart from "../components/reports/SalesPerformanceChart";
import ProductPerformanceTable from "../components/reports/ProductPerformanceTable";
import CustomerInsightsPanel from "../components/reports/CustomerInsightsPanel";
import InventoryStatusPanel from "../components/reports/InventoryStatusPanel";
import ExportButton from "../components/reports/ExportButton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
          {change && (
            <div
              className={`flex items-center gap-1 text-sm mt-1 ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-secondary-600"
              }`}
            >
              {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
              {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const ReportsFilters = ({ filters, onFilterChange, reportData }) => {
  return (
    <div className="card mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onFilterChange({ ...filters, dateRange: e.target.value })
              }
              className="input-field"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisyear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Report Type
            </label>
            <select
              value={filters.reportType}
              onChange={(e) =>
                onFilterChange({ ...filters, reportType: e.target.value })
              }
              className="input-field"
            >
              <option value="overview">Overview</option>
              <option value="sales">Sales Report</option>
              <option value="products">Product Performance</option>
              <option value="customers">Customer Analytics</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Compare To</label>
            <select
              value={filters.comparison}
              onChange={(e) =>
                onFilterChange({ ...filters, comparison: e.target.value })
              }
              className="input-field"
            >
              <option value="previous">Previous Period</option>
              <option value="lastyear">Same Period Last Year</option>
              <option value="none">No Comparison</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <ExportButton reportsData={reportData} period={filters.dateRange} />
        </div>
      </div>
    </div>
  );
};

const TopProductsTable = ({ products }) => (
  <div className="card">
    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
      <TrendingUp className="w-5 h-5" />
      Top Performing Products
    </h3>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-secondary-200">
            <th className="text-left py-3 text-sm font-medium text-secondary-600">
              Product
            </th>
            <th className="text-left py-3 text-sm font-medium text-secondary-600">
              Sales
            </th>
            <th className="text-left py-3 text-sm font-medium text-secondary-600">
              Revenue
            </th>
            <th className="text-left py-3 text-sm font-medium text-secondary-600">
              Views
            </th>
            <th className="text-left py-3 text-sm font-medium text-secondary-600">
              Conversion
            </th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product, index) => (
            <tr key={product.id} className="table-row">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-secondary-500">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-secondary-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {product.sku}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3 text-secondary-400" />
                  <span className="text-sm font-medium">
                    {product.salesCount || 0}
                  </span>
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-secondary-400" />
                  <span className="text-sm font-medium">
                    $
                    {(
                      (product.salesCount || 0) * parseFloat(product.price || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-secondary-400" />
                  <span className="text-sm">{product.viewCount || 0}</span>
                </div>
              </td>
              <td className="py-3">
                <span className="text-sm text-secondary-600">
                  {product.viewCount > 0
                    ? `${(
                        ((product.salesCount || 0) / product.viewCount) *
                        100
                      ).toFixed(1)}%`
                    : "0%"}
                </span>
              </td>
            </tr>
          )) || (
            <tr>
              <td colSpan="5" className="py-8 text-center text-secondary-500">
                No product data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: "last30days",
    reportType: "overview",
    comparison: "previous",
  });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await axiosInstance.get(`/admin/reports?${params}`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const response = await axiosInstance.get(`/admin/reports?${params}`);
        setReportData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [filters]);

  if (loading) {
    return (
      <Layout
        title="Reports & Analytics"
        subtitle="Business intelligence and performance metrics"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Reports & Analytics"
      subtitle="Business intelligence and performance metrics"
    >
      <div className="space-y-6">
        <ReportsFilters filters={filters} onFilterChange={handleFilterChange} />

        {error ? (
          <div className="card text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchReportData} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={
                  reportData?.overview?.totalRevenue
                    ? `$${parseFloat(reportData.overview.totalRevenue).toFixed(
                        2
                      )}`
                    : "$0.00"
                }
                change={
                  reportData?.overview?.revenueChange
                    ? `${
                        reportData.overview.revenueChange > 0 ? "+" : ""
                      }${reportData.overview.revenueChange.toFixed(1)}%`
                    : null
                }
                trend={
                  reportData?.overview?.revenueChange > 0
                    ? "up"
                    : reportData?.overview?.revenueChange < 0
                    ? "down"
                    : null
                }
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Total Orders"
                value={reportData?.overview?.totalOrders || "0"}
                change={
                  reportData?.overview?.ordersChange
                    ? `${
                        reportData.overview.ordersChange > 0 ? "+" : ""
                      }${reportData.overview.ordersChange.toFixed(1)}%`
                    : null
                }
                trend={
                  reportData?.overview?.ordersChange > 0
                    ? "up"
                    : reportData?.overview?.ordersChange < 0
                    ? "down"
                    : null
                }
                icon={ShoppingCart}
                color="blue"
              />
              <StatCard
                title="New Customers"
                value={reportData?.overview?.newCustomers || "0"}
                change={
                  reportData?.overview?.customersChange
                    ? `${
                        reportData.overview.customersChange > 0 ? "+" : ""
                      }${reportData.overview.customersChange.toFixed(1)}%`
                    : null
                }
                trend={
                  reportData?.overview?.customersChange > 0
                    ? "up"
                    : reportData?.overview?.customersChange < 0
                    ? "down"
                    : null
                }
                icon={Users}
                color="purple"
              />
              <StatCard
                title="Avg Order Value"
                value={
                  reportData?.overview?.avgOrderValue
                    ? `$${parseFloat(reportData.overview.avgOrderValue).toFixed(
                        2
                      )}`
                    : "$0.00"
                }
                change={
                  reportData?.overview?.aovChange
                    ? `${
                        reportData.overview.aovChange > 0 ? "+" : ""
                      }${reportData.overview.aovChange.toFixed(1)}%`
                    : null
                }
                trend={
                  reportData?.overview?.aovChange > 0
                    ? "up"
                    : reportData?.overview?.aovChange < 0
                    ? "down"
                    : null
                }
                icon={Activity}
                color="orange"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesPerformanceChart
                data={reportData?.charts?.salesChart}
                title="Sales Performance"
                period={filters.dateRange}
              />
              <SalesPerformanceChart
                data={reportData?.charts?.ordersChart}
                title="Order Trends"
                period={filters.dateRange}
              />
            </div>

            {/* Analytics Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductPerformanceTable
                products={reportData?.products?.topProducts}
                title="Top Performing Products"
              />
              <CustomerInsightsPanel
                customers={reportData?.customers}
                title="Customer Analytics"
              />
            </div>

            {/* Inventory Status */}
            <InventoryStatusPanel
              inventory={reportData?.inventory}
              title="Inventory Status & Alerts"
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
