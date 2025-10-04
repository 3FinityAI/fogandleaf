import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Save,
  X,
  Package,
  User,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import StatusBadge from "./StatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const OrderManagementModal = ({ order, isOpen, onClose, onUpdate }) => {
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const fetchOrderDetails = useCallback(
    async (orderId) => {
      if (!orderId) return;

      setLoadingItems(true);
      try {
        // Try to get complete order details
        const response = await axiosInstance.get(`/admin/orders/${orderId}`);
        if (response.data && response.data.success) {
          const details = response.data.data;
          setOrderDetails(details);
          setOrderItems(
            details.items || details.orderItems || details.products || []
          );
        } else {
          // Fallback to basic order info
          setOrderDetails(order);

          // Try to get items separately
          try {
            const itemsResponse = await axiosInstance.get(
              `/admin/orders/${orderId}/items`
            );
            if (itemsResponse.data?.success) {
              setOrderItems(itemsResponse.data.data || []);
            }
          } catch (err) {
            console.warn("Could not fetch order items separately:", err);
            setOrderItems(
              order?.items || order?.orderItems || order?.products || []
            );
          }
        }
      } catch (error) {
        console.warn("Could not fetch order details:", error);
        setOrderDetails(order);
        setOrderItems(
          order?.items || order?.orderItems || order?.products || []
        );
      } finally {
        setLoadingItems(false);
      }
    },
    [order]
  );

  useEffect(() => {
    if (order && isOpen) {
      setOrderStatus(order.status || "");
      setPaymentStatus(order.paymentStatus || "");
      setEditMode(false);
      fetchOrderDetails(order.id);
    }
  }, [order, isOpen, fetchOrderDetails]);

  const handleUpdate = async () => {
    if (!order?.id) return;

    setUpdating(true);
    try {
      // Update order status if changed
      if (orderStatus !== order.status) {
        await axiosInstance.put(`/admin/orders/${order.id}/status`, {
          status: orderStatus,
        });
      }

      // Update payment status if changed
      if (paymentStatus !== order.paymentStatus) {
        await axiosInstance.put(`/admin/orders/${order.id}/payment`, {
          paymentStatus: paymentStatus,
        });
      }

      onUpdate(order.id, { status: orderStatus, paymentStatus });
      setEditMode(false);

      // Show success message
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setOrderStatus(order.status || "");
    setPaymentStatus(order.paymentStatus || "");
    setEditMode(false);
  };

  if (!isOpen || !order) return null;

  const displayOrder = orderDetails || order;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Order Management:{" "}
              {displayOrder.orderNumber || `#${displayOrder.id}`}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {displayOrder.createdAt || displayOrder.created_at
                ? new Date(
                    displayOrder.createdAt || displayOrder.created_at
                  ).toLocaleString("en-IN")
                : "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Status
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status Row */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Order Status:
                </span>
                <StatusBadge status={displayOrder.status || "pending"} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Payment Status:
                </span>
                <PaymentStatusBadge
                  status={displayOrder.paymentStatus || "pending"}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {Number(
                  displayOrder.totalAmount || displayOrder.total_amount || 0
                ).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
          </div>

          {/* Edit Status Section */}
          {editMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Update Order Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {displayOrder.contactEmail ||
                      displayOrder.customer_email ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {displayOrder.contactPhone ||
                      displayOrder.customer_phone ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {displayOrder.shippingFirstName &&
                    displayOrder.shippingLastName
                      ? `${displayOrder.shippingFirstName} ${displayOrder.shippingLastName}`
                      : displayOrder.customerName ||
                        displayOrder.customer_name ||
                        "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Info
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">
                    {displayOrder.shippingAddress ||
                      displayOrder.deliveryAddress ||
                      displayOrder.shipping_address ||
                      "N/A"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City:</span>
                  <span className="font-medium">
                    {displayOrder.shippingCity || displayOrder.city || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pincode:</span>
                  <span className="font-medium">
                    {displayOrder.shippingPincode ||
                      displayOrder.pincode ||
                      displayOrder.postal_code ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">State:</span>
                  <span className="font-medium">
                    {displayOrder.shippingState || displayOrder.state || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ₹
                    {Number(
                      displayOrder.subtotal ||
                        displayOrder.totalAmount ||
                        displayOrder.total_amount ||
                        0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">
                    ₹
                    {Number(
                      displayOrder.shippingCost ||
                        displayOrder.deliveryFee ||
                        displayOrder.shipping_fee ||
                        0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">
                    ₹
                    {Number(
                      displayOrder.taxAmount || displayOrder.tax || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total:</span>
                  <span>
                    ₹
                    {Number(
                      displayOrder.totalAmount || displayOrder.total_amount || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium ml-1">
                    {displayOrder.paymentMethod || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({orderItems.length})
            </h4>

            {loadingItems ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading order items...
              </div>
            ) : orderItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">
                        {item.productName ||
                          item.product_name ||
                          item.name ||
                          item.product?.name ||
                          "Product"}
                      </h5>
                      <p className="text-sm text-gray-600">
                        SKU:{" "}
                        {item.sku ||
                          item.productId ||
                          item.product?.id ||
                          "N/A"}
                      </p>
                      {item.specifications && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.specifications}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          Qty:{" "}
                          <span className="font-medium">
                            {item.quantity || 1}
                          </span>
                        </span>
                        <span className="text-sm text-gray-600">
                          ₹
                          {Number(
                            item.unitPrice ||
                              item.price ||
                              item.product?.price ||
                              0
                          ).toFixed(2)}{" "}
                          each
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">
                        ₹
                        {Number(
                          (item.quantity || 1) *
                            (item.unitPrice ||
                              item.price ||
                              item.product?.price ||
                              0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No items found</p>
                <p className="text-sm">
                  This order doesn't have any items listed
                </p>
              </div>
            )}
          </div>

          {/* Special Instructions/Notes */}
          {(displayOrder.notes || displayOrder.orderNotes) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Order Notes</h4>
              <p className="text-sm text-gray-700">
                {displayOrder.notes || displayOrder.orderNotes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementModal;
