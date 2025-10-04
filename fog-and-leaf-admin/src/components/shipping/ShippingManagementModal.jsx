import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Save,
  X,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Edit,
  Copy,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import ShippingStatusBadge from "./ShippingStatusBadge";

const ShippingManagementModal = ({ shipment, isOpen, onClose, onUpdate }) => {
  const [shippingStatus, setShippingStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchShipmentDetails = useCallback(
    async (shipmentId) => {
      if (!shipmentId) return;

      setLoadingDetails(true);
      try {
        // Get shipment details with order information
        const response = await axiosInstance.get(
          `/admin/shipments/${shipmentId}`
        );
        if (response.data && response.data.success) {
          const details = response.data.data;
          setOrderDetails(details.order || details);
          setTrackingHistory(details.trackingHistory || []);
        } else {
          // Fallback: get order details separately
          if (shipment.orderId) {
            const orderResponse = await axiosInstance.get(
              `/admin/orders/${shipment.orderId}`
            );
            if (orderResponse.data?.success) {
              setOrderDetails(orderResponse.data.data);
            }
          }
        }
      } catch (error) {
        console.warn("Could not fetch shipment details:", error);
        setOrderDetails(shipment.order || null);
        setTrackingHistory([]);
      } finally {
        setLoadingDetails(false);
      }
    },
    [shipment]
  );

  useEffect(() => {
    if (shipment && isOpen) {
      setShippingStatus(shipment.status || shipment.shippingStatus || "");
      setTrackingNumber(shipment.trackingNumber || "");
      setCarrier(shipment.carrier || "");
      setEstimatedDelivery(
        shipment.estimatedDelivery
          ? shipment.estimatedDelivery.split("T")[0]
          : ""
      );
      setDeliveryNotes(shipment.deliveryNotes || shipment.notes || "");
      setEditMode(false);
      fetchShipmentDetails(shipment.id);
    }
  }, [shipment, isOpen, fetchShipmentDetails]);

  const handleUpdate = async () => {
    if (!shipment?.id) return;

    setUpdating(true);
    try {
      const updates = {
        status: shippingStatus,
        trackingNumber: trackingNumber,
        carrier: carrier,
        estimatedDelivery: estimatedDelivery || null,
        deliveryNotes: deliveryNotes,
      };

      await axiosInstance.put(`/admin/shipments/${shipment.id}`, updates);

      onUpdate(shipment.id, updates);
      setEditMode(false);

      // Show success message
      alert("Shipment updated successfully!");
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert("Failed to update shipment. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setShippingStatus(shipment.status || shipment.shippingStatus || "");
    setTrackingNumber(shipment.trackingNumber || "");
    setCarrier(shipment.carrier || "");
    setEstimatedDelivery(
      shipment.estimatedDelivery ? shipment.estimatedDelivery.split("T")[0] : ""
    );
    setDeliveryNotes(shipment.deliveryNotes || shipment.notes || "");
    setEditMode(false);
  };

  const copyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      alert("Tracking number copied to clipboard!");
    }
  };

  const openCarrierTracking = () => {
    if (!trackingNumber || !carrier) return;

    const trackingUrls = {
      dhl: `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
      fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      bluedart: `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${trackingNumber}`,
      dtdc: `https://www.dtdc.in/tracking/packageinfo?strTrackNo=${trackingNumber}`,
      aramex: `https://www.aramex.com/track/results?ShipmentNumber=${trackingNumber}`,
      indiapost: `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=${trackingNumber}`,
      ekart: `https://ekart.in/tracking?trackingid=${trackingNumber}`,
    };

    const url = trackingUrls[carrier.toLowerCase()];
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (!isOpen || !shipment) return null;

  const displayOrder = orderDetails || shipment.order || {};
  const orderNumber =
    shipment.orderNumber ||
    displayOrder.orderNumber ||
    `#${shipment.orderId || shipment.id}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="h-6 w-6 text-blue-600" />
              Shipping Management: {orderNumber}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Track and manage shipment status, carrier information, and
              delivery updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Shipping
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
          {/* Current Status Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Current Status
                  </h4>
                  <ShippingStatusBadge
                    status={
                      shipment.status || shipment.shippingStatus || "pending"
                    }
                  />
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Tracking Number</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-1 rounded border text-sm font-mono">
                    {shipment.trackingNumber || "Not assigned"}
                  </code>
                  {shipment.trackingNumber && (
                    <>
                      <button
                        onClick={copyTrackingNumber}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copy tracking number"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={openCarrierTracking}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Track on carrier website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Shipping Section */}
          {editMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Update Shipping Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Status
                  </label>
                  <select
                    value={shippingStatus}
                    onChange={(e) => setShippingStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrier
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Carrier</option>
                    <option value="dhl">DHL</option>
                    <option value="fedex">FedEx</option>
                    <option value="bluedart">Blue Dart</option>
                    <option value="dtdc">DTDC</option>
                    <option value="aramex">Aramex</option>
                    <option value="indiapost">India Post</option>
                    <option value="ekart">Ekart</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery
                  </label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Notes
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={3}
                  placeholder="Add delivery notes, special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                      Update Shipping
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Information
              </h4>

              {loadingDetails ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Loading order details...
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">
                      {displayOrder.contactEmail ||
                        displayOrder.customer_email ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">
                      {displayOrder.contactPhone ||
                        displayOrder.customer_phone ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total:</span>
                    <span className="font-medium">
                      ₹
                      {Number(
                        displayOrder.totalAmount ||
                          displayOrder.total_amount ||
                          0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">
                      {displayOrder.createdAt
                        ? new Date(displayOrder.createdAt).toLocaleDateString(
                            "en-IN"
                          )
                        : "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">
                    {displayOrder.shippingFirstName &&
                    displayOrder.shippingLastName
                      ? `${displayOrder.shippingFirstName} ${displayOrder.shippingLastName}`
                      : displayOrder.customerName || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">
                    {displayOrder.shippingAddress ||
                      displayOrder.deliveryAddress ||
                      "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">City:</span>
                    <p className="font-medium">
                      {displayOrder.shippingCity || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">State:</span>
                    <p className="font-medium">
                      {displayOrder.shippingState || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Pincode:</span>
                    <p className="font-medium">
                      {displayOrder.shippingPincode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <p className="font-medium">
                      {displayOrder.shippingCountry || "India"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Shipping Timeline
            </h4>

            {trackingHistory.length > 0 ? (
              <div className="space-y-4">
                {trackingHistory.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {event.status}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.location} •{" "}
                        {new Date(event.timestamp).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No tracking history available</p>
                <p className="text-sm">
                  Tracking events will appear here once the shipment is in
                  transit
                </p>
              </div>
            )}
          </div>

          {/* Delivery Notes */}
          {shipment.deliveryNotes && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Delivery Notes
              </h4>
              <p className="text-sm text-gray-700">{shipment.deliveryNotes}</p>
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

export default ShippingManagementModal;
