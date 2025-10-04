import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

const SalesPerformanceChart = ({ data, title, period }) => {
  const [chartType, setChartType] = useState("revenue");

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-secondary-400" />
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="revenue">Revenue</option>
              <option value="orders">Orders</option>
            </select>
          </div>
        </div>

        <div className="h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-secondary-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No sales data available</p>
            <p className="text-xs">for the selected period</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals and trends
  const total = data.reduce((sum, item) => {
    return (
      sum +
      parseFloat(
        chartType === "revenue" ? item.totalRevenue || 0 : item.orderCount || 0
      )
    );
  }, 0);

  // Calculate trend (comparing first half vs second half)
  const midPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midPoint);
  const secondHalf = data.slice(midPoint);

  const firstHalfTotal = firstHalf.reduce((sum, item) => {
    return (
      sum +
      parseFloat(
        chartType === "revenue" ? item.totalRevenue || 0 : item.orderCount || 0
      )
    );
  }, 0);

  const secondHalfTotal = secondHalf.reduce((sum, item) => {
    return (
      sum +
      parseFloat(
        chartType === "revenue" ? item.totalRevenue || 0 : item.orderCount || 0
      )
    );
  }, 0);

  const avgFirst = firstHalfTotal / (firstHalf.length || 1);
  const avgSecond = secondHalfTotal / (secondHalf.length || 1);
  const trendPercentage =
    avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;
  const isPositiveTrend = trendPercentage > 0;

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map((item) =>
      parseFloat(
        chartType === "revenue" ? item.totalRevenue || 0 : item.orderCount || 0
      )
    )
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {chartType === "revenue" ? (
                <DollarSign className="w-4 h-4 text-green-600" />
              ) : (
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-2xl font-bold">
                {chartType === "revenue" ? `$${total.toFixed(2)}` : total}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                isPositiveTrend ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositiveTrend ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(trendPercentage).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-secondary-400" />
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
          </select>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="h-64 flex items-end justify-between gap-1 px-2">
        {data.map((item, index) => {
          const value = parseFloat(
            chartType === "revenue"
              ? item.totalRevenue || 0
              : item.orderCount || 0
          );
          const height = maxValue > 0 ? (value / maxValue) * 200 : 0;

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 max-w-12"
            >
              <div className="w-full flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                    chartType === "revenue"
                      ? "bg-gradient-to-t from-green-500 to-green-400"
                      : "bg-gradient-to-t from-blue-500 to-blue-400"
                  }`}
                  style={{ height: `${height}px` }}
                  title={`${item.period}: ${
                    chartType === "revenue" ? `$${value.toFixed(2)}` : value
                  }`}
                />
                <div className="text-xs text-secondary-500 mt-2 text-center w-full truncate">
                  {item.period}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Legend */}
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded ${
                  chartType === "revenue" ? "bg-green-500" : "bg-blue-500"
                }`}
              />
              <span>{chartType === "revenue" ? "Revenue" : "Orders"}</span>
            </div>
            <span>{data.length} data points</span>
          </div>
          <div className="text-right">
            <div>Period: {period}</div>
            <div>
              Avg:{" "}
              {chartType === "revenue"
                ? `$${(total / data.length).toFixed(2)}`
                : (total / data.length).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceChart;
