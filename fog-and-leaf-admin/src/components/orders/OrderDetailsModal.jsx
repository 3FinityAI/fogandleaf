import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  X,
  Package,
  User,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import StatusBadge from "./StatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

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
          setOrderItems(details.items || details.orderItems || []);
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
            setOrderItems(order?.items || order?.orderItems || []);
          }
        }
      } catch (error) {
        console.warn("Could not fetch order details:", error);
        setOrderDetails(order);
        setOrderItems(order?.items || order?.orderItems || []);
      } finally {
        setLoadingItems(false);
      }
    },
    [order]
  );

  useEffect(() => {
    if (order && isOpen) {
      fetchOrderDetails(order.id);
    }
  }, [order, isOpen, fetchOrderDetails]);

  if (!isOpen || !order) return null;

  const displayOrder = orderDetails || order;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Order Details: {displayOrder.orderNumber || `#${displayOrder.id}`}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {displayOrder.createdAt || displayOrder.created_at
                ? new Date(
                    displayOrder.createdAt || displayOrder.created_at
                  ).toLocaleString("en-IN")
                : "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Row */}
          <div className="flex items-center gap-4">
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">
                    {displayOrder.contactEmail ||
                      displayOrder.customer_email ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">
                    {displayOrder.contactPhone ||
                      displayOrder.customer_phone ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {displayOrder.customerName ||
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
                Delivery Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">
                    {displayOrder.deliveryAddress ||
                      displayOrder.shipping_address ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">City:</span>
                  <span className="font-medium ml-1">
                    {displayOrder.city || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pincode:</span>
                  <span className="font-medium ml-1">
                    {displayOrder.pincode || displayOrder.postal_code || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
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
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">
                    ₹
                    {Number(
                      displayOrder.deliveryFee || displayOrder.shipping_fee || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">
                    ₹{Number(displayOrder.tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="font-semibold text-lg">
                    ₹
                    {Number(
                      displayOrder.totalAmount || displayOrder.total_amount || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium ml-1">
                    {displayOrder.paymentMethod || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Order Timeline
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Placed:</span>
                  <span className="font-medium">
                    {displayOrder.createdAt || displayOrder.created_at
                      ? new Date(
                          displayOrder.createdAt || displayOrder.created_at
                        ).toLocaleDateString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {displayOrder.updatedAt || displayOrder.updated_at
                      ? new Date(
                          displayOrder.updatedAt || displayOrder.updated_at
                        ).toLocaleDateString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                {displayOrder.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Delivery:</span>
                    <span className="font-medium">
                      {new Date(
                        displayOrder.estimatedDelivery
                      ).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                )}
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
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image Placeholder */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>

                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {item.productName ||
                            item.product_name ||
                            item.name ||
                            "Product"}
                        </h5>
                        <p className="text-sm text-gray-600">
                          SKU: {item.sku || item.productId || "N/A"}
                        </p>
                        {item.specifications && (
                          <p className="text-xs text-gray-500 mt-1">
                            {item.specifications}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            Qty:{" "}
                            <span className="font-medium">
                              {item.quantity || 1}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            Unit Price:{" "}
                            <span className="font-medium">
                              ₹
                              {Number(
                                item.price || item.unitPrice || 0
                              ).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
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
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No items found</p>
                <p className="text-sm">
                  This order doesn't have any items listed
                </p>
              </div>
            )}
          </div>

          {/* Special Instructions */}
          {displayOrder.notes && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Special Instructions
              </h4>
              <p className="text-sm text-gray-700">{displayOrder.notes}</p>
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

export default OrderDetailsModal;
