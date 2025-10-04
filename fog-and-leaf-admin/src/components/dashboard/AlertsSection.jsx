import { AlertTriangle } from "lucide-react";
import { generateAlerts } from "../../utils/dashboardUtils";

const AlertsSection = ({ stats }) => {
  const alerts = generateAlerts(stats);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        Alerts & Notifications
      </h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
              alert.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-yellow-50 border-yellow-200 text-yellow-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{alert.message}</span>
            </div>
            {alert.link ? (
              <a
                href={alert.link}
                className="text-sm font-medium hover:underline transition-colors"
              >
                {alert.action}
              </a>
            ) : (
              <button className="text-sm font-medium hover:underline transition-colors">
                {alert.action}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsSection;
