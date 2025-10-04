const PaymentStatusBadge = ({ status }) => {
  const paymentStyles = {
    pending: "bg-orange-100 text-orange-800 border-orange-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    refunded: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${
        paymentStyles[status] || paymentStyles.pending
      }`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default PaymentStatusBadge;
