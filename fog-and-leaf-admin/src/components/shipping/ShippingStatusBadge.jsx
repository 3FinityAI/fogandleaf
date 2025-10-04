const ShippingStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "Pending",
        };
      case "shipped":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          label: "Shipped",
        };
      case "in_transit":
      case "in-transit":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          label: "In Transit",
        };
      case "out_for_delivery":
      case "out-for-delivery":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          label: "Out for Delivery",
        };
      case "delivered":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Delivered",
        };
      case "returned":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          label: "Returned",
        };
      case "cancelled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          label: status || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default ShippingStatusBadge;
