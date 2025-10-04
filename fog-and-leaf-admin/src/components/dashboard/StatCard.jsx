import { TrendingUp } from "lucide-react";
import { getStatCardColors } from "../../utils/dashboardUtils";

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "primary",
  trend,
}) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-secondary-600",
  };

  return (
    <div className="bg-white rounded-lg border border-secondary-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-secondary-900">{value}</p>
          {change && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trendColors[trend] || trendColors.neutral
              }`}
            >
              <TrendingUp
                className={`w-3 h-3 ${trend === "down" ? "rotate-180" : ""}`}
              />
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg border flex items-center justify-center ${getStatCardColors(
            color
          )}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
