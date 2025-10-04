import {
  formatCurrency,
  formatDate,
  getOrderStatusStyle,
} from "../../utils/dashboardUtils";

const RecentOrdersTable = ({ orders = [] }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Recent Orders
        </h3>
        <div className="text-center py-8 text-secondary-500">
          No recent orders found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">
          Recent Orders
        </h3>
        <a
          href="/orders"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
        >
          View All
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Order
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Customer
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Amount
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Status
              </th>
              <th className="text-left py-3 text-sm font-medium text-secondary-600">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                <td className="py-3">
                  <span className="font-medium text-secondary-900">
                    {order.orderNumber || `#${order.id}`}
                  </span>
                </td>
                <td className="py-3 text-secondary-700">
                  {order.shippingFirstName} {order.shippingLastName}
                </td>
                <td className="py-3 font-medium text-secondary-900">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 text-secondary-600 text-sm">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
