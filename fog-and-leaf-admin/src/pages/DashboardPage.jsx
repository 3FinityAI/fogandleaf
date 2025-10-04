import { useState, useEffect } from "react";
import { IndianRupeeIcon, ShoppingBag, Package, Clock } from "lucide-react";

import Layout from "../components/Layout";
import StatCard from "../components/dashboard/StatCard";
import AlertsSection from "../components/dashboard/AlertsSection";
import RecentOrdersTable from "../components/dashboard/RecentOrdersTable";
import QuickActions from "../components/dashboard/QuickActions";
import LoadingSpinner from "../components/dashboard/LoadingSpinner";
import ErrorDisplay from "../components/dashboard/ErrorDisplay";

import axiosInstance from "../utils/axiosInstance";
import { formatCurrency, formatNumber } from "../utils/dashboardUtils";

const QuickStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
    <StatCard
      title="Total Revenue"
      value={formatCurrency(stats.totalRevenue)}
      change={`${formatCurrency(stats.monthlyRevenue)} this month`}
      icon={IndianRupeeIcon}
      color="green"
      trend="up"
    />
    <StatCard
      title="Total Orders"
      value={formatNumber(stats.totalOrders)}
      change={`${stats.todayOrders || 0} today`}
      icon={ShoppingBag}
      color="blue"
      trend="up"
    />
    <StatCard
      title="Pending Orders"
      value={formatNumber(stats.pendingOrders)}
      change={`${stats.monthlyOrders || 0} orders this month`}
      icon={Clock}
      color="orange"
      trend="neutral"
    />
    <StatCard
      title="Products"
      value={formatNumber(stats.totalProducts)}
      change={`${stats.lowStockProducts || 0} low stock`}
      icon={Package}
      color="primary"
    />
  </div>
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/admin/dashboard");
      setDashboardData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening."
      >
        <LoadingSpinner message="Loading dashboard..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <ErrorDisplay
          title="Failed to Load Dashboard"
          message={error}
          onRetry={fetchDashboardData}
        />
      </Layout>
    );
  }

  const { overview = {}, recentOrders = [] } = dashboardData || {};

  return (
    <Layout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your store."
    >
      <div className="space-y-8">
        <QuickStatsGrid stats={overview} />

        <AlertsSection stats={overview} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <RecentOrdersTable orders={recentOrders} />
          </div>

          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
