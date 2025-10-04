import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Search,
  ArrowLeft,
  Calendar,
  User,
  Hash,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../utility/axiosInstance";

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState(
    searchParams.get("tracking") || ""
  );
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || ""
  );
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track order by tracking number or order number
  const handleTrackOrder = async (e) => {
    e.preventDefault();

    if (!trackingNumber && !orderNumber) {
      setError("Please enter either tracking number or order number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const searchParam = trackingNumber || orderNumber;
      const response = await axiosInstance.get(`/orders/track/${searchParam}`);

      if (response.data.success) {
        setOrderData(response.data.data);
      } else {
        setError(response.data.message || "Order not found");
        setOrderData(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to track order. Please try again."
      );
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if tracking number is in URL
  useEffect(() => {
    if (trackingNumber || orderNumber) {
      handleTrackOrder({ preventDefault: () => {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

  const getDeliveryProgress = (status) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = steps.indexOf(status);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Track Your Order
            </h1>
          </div>
          <p className="text-gray-600">
            Enter your tracking number or order number to get real-time updates
            on your delivery
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Your Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter order number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || (!trackingNumber && !orderNumber)}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6">
            {/* Order Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(orderData.status)}
                    Order Status
                  </span>
                  <Badge
                    className={`${getStatusColor(orderData.status)} border`}
                  >
                    {orderData.status.charAt(0).toUpperCase() +
                      orderData.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${getDeliveryProgress(orderData.status)}%`,
                      }}
                    ></div>
                  </div>

                  {/* Order Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Order:</span>
                      <span className="font-medium">
                        {orderData.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Placed:</span>
                      <span className="font-medium">
                        {formatDate(orderData.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(orderData.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  {orderData.trackingNumber && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Tracking Number
                        </span>
                      </div>
                      <div className="font-mono text-lg font-bold text-purple-700">
                        {orderData.trackingNumber}
                      </div>
                      <div className="text-sm text-purple-600 mt-1">
                        Carrier: {orderData.carrier || "Standard"}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Delivery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-3 ${
                      orderData.createdAt ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        orderData.createdAt ? "bg-green-600" : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium">Order Placed</div>
                      <div className="text-sm">
                        {formatDate(orderData.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 ${
                      ["processing", "shipped", "delivered"].includes(
                        orderData.status
                      )
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        ["processing", "shipped", "delivered"].includes(
                          orderData.status
                        )
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium">
                        Order Confirmed & Processing
                      </div>
                      <div className="text-sm">
                        {orderData.status === "processing" ||
                        orderData.status === "shipped" ||
                        orderData.status === "delivered"
                          ? "Your order is being prepared"
                          : "Pending confirmation"}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 ${
                      ["shipped", "delivered"].includes(orderData.status)
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        ["shipped", "delivered"].includes(orderData.status)
                          ? "bg-purple-600"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium">Shipped</div>
                      <div className="text-sm">
                        {orderData.shippedAt
                          ? formatDate(orderData.shippedAt)
                          : orderData.status === "shipped" ||
                            orderData.status === "delivered"
                          ? "In transit to your location"
                          : "Will be shipped soon"}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 ${
                      orderData.status === "delivered"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        orderData.status === "delivered"
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium">Delivered</div>
                      <div className="text-sm">
                        {orderData.deliveredAt
                          ? formatDate(orderData.deliveredAt)
                          : "Estimated delivery within 3-7 business days"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      {orderData.shippingFirstName} {orderData.shippingLastName}
                    </p>
                    <p className="text-gray-700">{orderData.shippingAddress}</p>
                    <p className="text-gray-700">
                      {orderData.shippingCity}, {orderData.shippingState}{" "}
                      {orderData.shippingPincode}
                    </p>
                    <p className="text-gray-700">{orderData.shippingCountry}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {orderData.contactEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {orderData.contactPhone}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({orderData.OrderProducts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.OrderProducts?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.Product?.name || "Product"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} ×{" "}
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(orderData.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        {orderData.shippingCost > 0
                          ? formatCurrency(orderData.shippingCost)
                          : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span className="text-green-600">
                        {formatCurrency(orderData.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
