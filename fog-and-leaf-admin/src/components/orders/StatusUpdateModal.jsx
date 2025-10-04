import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Save, X, Package } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const StatusUpdateModal = ({ order, isOpen, onClose, onUpdate }) => {
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const fetchOrderItems = useCallback(
    async (orderId) => {
      if (!orderId) return;

      setLoadingItems(true);
      try {
        const response = await axiosInstance.get(
          `/admin/orders/${orderId}/items`
        );
        if (response.data && response.data.success) {
          setOrderItems(response.data.data || []);
        } else {
          // Fallback: if items endpoint doesn't exist, try to get from order details
          const orderResponse = await axiosInstance.get(
            `/admin/orders/${orderId}`
          );
          if (orderResponse.data?.success) {
            setOrderItems(
              orderResponse.data.data?.items ||
                orderResponse.data.data?.orderItems ||
                []
            );
          }
        }
      } catch (error) {
        console.warn("Could not fetch order items:", error);
        // Set fallback items if available in order object
        setOrderItems(order?.items || order?.orderItems || []);
      } finally {
        setLoadingItems(false);
      }
    },
    [order]
  );

  useEffect(() => {
    if (order) {
      setOrderStatus(order.status || "");
      setPaymentStatus(order.paymentStatus || "");
      fetchOrderItems(order.id);
    }
  }, [order, fetchOrderItems]);

  const handleUpdate = async () => {
    if (!order?.id) return;

    setUpdating(true);
    try {
      // Update order status
      if (orderStatus !== order.status) {
        await axiosInstance.put(`/admin/orders/${order.id}/status`, {
          status: orderStatus,
        });
      }

      // Update payment status
      if (paymentStatus !== order.paymentStatus) {
        await axiosInstance.put(`/admin/orders/${order.id}/payment`, {
          paymentStatus: paymentStatus,
        });
      }

      onUpdate(order.id, { status: orderStatus, paymentStatus });
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Order {order.orderNumber || order.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Order Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Customer:</span>
                <p className="font-medium">
                  {order.contactEmail || order.customer_email || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium">
                  {order.contactPhone || order.customer_phone || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <p className="font-medium">
                  ₹
                  {Number(order.totalAmount || order.total_amount || 0).toFixed(
                    2
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Order Date:</span>
                <p className="font-medium">
                  {order.createdAt || order.created_at
                    ? new Date(
                        order.createdAt || order.created_at
                      ).toLocaleDateString("en-IN")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h4>

            {loadingItems ? (
              <div className="text-center py-4 text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading items...
              </div>
            ) : orderItems.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {item.productName ||
                          item.product_name ||
                          item.name ||
                          "Product"}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity || 1} × ₹
                        {Number(item.price || item.unitPrice || 0).toFixed(2)}
                      </p>
                      {item.specifications && (
                        <p className="text-xs text-gray-500">
                          {item.specifications}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹
                        {Number(
                          (item.quantity || 1) *
                            (item.price || item.unitPrice || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No items found for this order</p>
              </div>
            )}
          </div>

          {/* Status Updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
