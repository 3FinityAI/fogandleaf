import { RefreshCw, Package, Settings } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const OrdersTable = ({ orders, loading, onManageOrder }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
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
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-gray-500">Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="space-y-2">
                    <Package className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="text-lg">No orders found</p>
                    <p className="text-sm">
                      Orders will appear here once customers start placing them
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                // Safe data extraction with logging for debugging
                const orderNumber = order.orderNumber || `#${order.id}`;
                const customerEmail =
                  order.contactEmail || order.customer_email || "N/A";
                const customerPhone =
                  order.contactPhone || order.customer_phone;
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
                      <div className="text-sm text-gray-900">
                        {customerEmail}
                      </div>
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
