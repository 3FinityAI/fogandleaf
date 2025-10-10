import {
  RefreshCw,
  Package,
  Settings,
  Truck,
  MapPin,
  Clock,
} from "lucide-react";
import ShippingStatusBadge from "./ShippingStatusBadge";

const ShippingTable = ({ shipments, loading, onManageShipment }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipping Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking
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
                    <span className="text-gray-500">Loading shipments...</span>
                  </div>
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="space-y-2">
                    <Package className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="text-lg">No shipments found</p>
                    <p className="text-sm">
                      Shipments will appear here once orders are shipped
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => {
                // Safe data extraction with logging for debugging
                const orderNumber =
                  shipment.orderNumber ||
                  shipment.order?.orderNumber ||
                  `#${shipment.orderId || shipment.id}`;
                const trackingNumber =
                  shipment.trackingNumber || "Not assigned";
                const carrier = shipment.carrier || "Standard";
                const status =
                  shipment.status || shipment.shippingStatus || "pending";
                const customerName =
                  shipment.customerName ||
                  (shipment.order?.shippingFirstName &&
                  shipment.order?.shippingLastName
                    ? `${shipment.order.shippingFirstName} ${shipment.order.shippingLastName}`
                    : shipment.user?.firstname && shipment.user?.lastname
                    ? `${shipment.user.firstname} ${shipment.user.lastname}`
                    : "N/A");

                // Calculate total amount and product count
                const totalAmount =
                  shipment.totalAmount || shipment.order?.totalAmount || 0;
                const productCount =
                  shipment.products?.length ||
                  shipment.order?.products?.length ||
                  0;

                // Safe date formatting
                let orderDate = "N/A";
                try {
                  const dateValue =
                    shipment.createdAt || shipment.order?.createdAt;
                  if (dateValue) {
                    orderDate = new Date(dateValue).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    );
                  }
                } catch (error) {
                  console.warn("⚠️ Invalid order date:", error);
                }

                return (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    {/* Order Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {orderDate}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customerName}
                      </div>
                    </td>

                    {/* Products */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {productCount} item{productCount !== 1 ? "s" : ""}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{totalAmount}
                      </div>
                    </td>

                    {/* Shipping Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ShippingStatusBadge status={status} />
                    </td>

                    {/* Tracking */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          <Truck className="h-4 w-4 text-gray-400" />
                          {trackingNumber}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {carrier}
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onManageShipment(shipment)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        title="Manage Shipment - Track & Update Status"
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

export default ShippingTable;
