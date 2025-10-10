import { X } from "lucide-react";
import OrderStats from "./OrderStats";

const OrdersSummary = ({
  pagination,
  filters,
  loading,
  error,
  onRetry,
  orderStats,
}) => {
  return (
    <>
      {/* Order Status Cards */}
      <OrderStats stats={orderStats} loading={loading} />

      {/* Results Summary */}
      {!loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {pagination.totalOrders} order
              {pagination.totalOrders !== 1 ? "s" : ""} found
              {(filters.search ||
                filters.status ||
                filters.paymentStatus ||
                filters.dateFrom ||
                filters.dateTo) &&
                " with current filters"}
            </span>
            {pagination.totalOrders > 0 && (
              <span className="text-blue-600 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={onRetry}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersSummary;
