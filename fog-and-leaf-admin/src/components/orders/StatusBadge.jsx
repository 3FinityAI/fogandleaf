import { CheckCircle, Clock, Truck, Package, X } from "lucide-react";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    processing: "bg-purple-100 text-purple-800 border-purple-200",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: X,
  };

  const Icon = statusIcons[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;
