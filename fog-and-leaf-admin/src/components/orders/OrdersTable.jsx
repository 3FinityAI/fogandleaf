import { RefreshCw, Package, Settings } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const OrdersTable = ({ orders, loading, onManageOrder }) => {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-500">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-12 text-center text-gray-500">
          <div className="space-y-2">
            <Package className="h-12 w-12 mx-auto text-gray-300" />
            <p className="text-lg">No orders found</p>
            <p className="text-sm">
              Orders will appear here once customers start placing them
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="space-y-3 p-4">
          {orders.map((order) => {
            // Safe data extraction
            const orderNumber = order.orderNumber || `#${order.id}`;
            const customerEmail =
              order.contactEmail || order.customer_email || "N/A";
            const customerPhone = order.contactPhone || order.customer_phone;
            const orderStatus = order.status || "pending";
            const paymentStatus = order.paymentStatus || "pending";

            // Safe number conversion for totalAmount
            let totalAmount = 0;
            try {
              totalAmount = Number(
                order.totalAmount || order.total_amount || 0
              );
              if (isNaN(totalAmount)) totalAmount = 0;
            } catch {
              totalAmount = 0;
            }

            // Safe date formatting
            let formattedDate = "N/A";
            try {
              const dateValue = order.createdAt || order.created_at;
              if (dateValue) {
                formattedDate = new Date(dateValue).toLocaleDateString(
                  "en-IN",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                );
              }
            } catch {
              formattedDate = "Invalid Date";
            }

            return (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                {/* Header with Order Info and Action */}
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {orderNumber}
                      </h3>
                      <StatusBadge status={orderStatus} />
                    </div>
                    <p className="text-xs text-gray-600 truncate mb-1">
                      {customerEmail}
                    </p>
                    {customerPhone && (
                      <p className="text-xs text-gray-500">{customerPhone}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm">
                        <span className="font-semibold text-green-600">
                          ₹{totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                  </div>

                  {/* Action Button - Always Visible */}
                  <div className="ml-3 flex-shrink-0">
                    <button
                      onClick={() => onManageOrder(order)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                      title="Manage Order"
                      aria-label={`Manage order ${orderNumber}`}
                    >
                      <Settings className="h-3 w-3" />
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
              // Safe data extraction with logging for debugging
              const orderNumber = order.orderNumber || `#${order.id}`;
              const customerEmail =
                order.contactEmail || order.customer_email || "N/A";
              const customerPhone = order.contactPhone || order.customer_phone;
              const orderStatus = order.status || "pending";
              const paymentStatus = order.paymentStatus || "pending";

              // Safe number conversion for totalAmount
              let totalAmount = 0;
              try {
                totalAmount = Number(
                  order.totalAmount || order.total_amount || 0
                );
                if (isNaN(totalAmount)) totalAmount = 0;
              } catch (error) {
                console.warn(
                  "⚠️ Invalid totalAmount for order:",
                  order.id,
                  order.totalAmount,
                  order.total_amount,
                  error
                );
                totalAmount = 0;
              }

              // Safe date formatting
              let formattedDate = "N/A";
              try {
                const dateValue = order.createdAt || order.created_at;
                if (dateValue) {
                  formattedDate = new Date(dateValue).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  );
                }
              } catch (error) {
                console.warn(
                  "⚠️ Invalid date for order:",
                  order.id,
                  order.createdAt,
                  order.created_at,
                  error
                );
              }

              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customerEmail}</div>
                    {customerPhone && (
                      <div className="text-sm text-gray-500">
                        {customerPhone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={orderStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={paymentStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onManageOrder(order)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      title="Manage Order - View Details & Update Status"
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
