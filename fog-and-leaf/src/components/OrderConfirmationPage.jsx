import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  Coffee,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

const OrderConfirmationPage = () => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Get order from sessionStorage (moved from localStorage for better security)
    const lastOrder = sessionStorage.getItem("lastOrder");
    console.log("OrderConfirmationPage - lastOrder data:", lastOrder);

    if (lastOrder) {
      const orderData = JSON.parse(lastOrder);
      console.log("OrderConfirmationPage - parsed order data:", orderData);
      setOrder(orderData);
      // Clear the order data after displaying
      sessionStorage.removeItem("lastOrder");
    } else {
      console.log(
        "OrderConfirmationPage - No order data found in sessionStorage"
      );
    }
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

  // If no order data, show error message
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Package className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your order information. Please check your email for
            confirmation details.
          </p>
          <Link to="/products">
            <Button className="bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-xl text-green-100 mb-6">
              Thank you for your order. We'll send you a confirmation email
              shortly.
            </p>
            <div className="bg-white/10 rounded-lg p-4 inline-block">
              <p className="text-sm text-green-100">Order Number</p>
              <p className="text-2xl font-bold">
                #{order.orderNumber || order.orderId || order.id}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 rounded-full p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order Confirmed
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Confirmed
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="bg-gray-100 rounded-full p-3">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Processing</p>
                        <p className="text-sm">We're preparing your order</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-400">
                      <div className="bg-gray-100 rounded-full p-3">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Shipped</p>
                        <p className="text-sm">Your order is on the way</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-400">
                      <div className="bg-gray-100 rounded-full p-3">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Delivered</p>
                        <p className="text-sm">
                          Estimated:{" "}
                          {estimatedDelivery.toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Coffee className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.category} • {item.weight}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{item.price * item.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            ₹{item.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress.name}
                    </p>
                    <p className="text-gray-700">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-gray-700">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    <p className="text-gray-700">
                      {order.shippingAddress.country}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{order.contactEmail}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">{order.contactPhone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24 space-y-6"
            >
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>
                        ₹
                        {order.totalAmount - (order.totalAmount > 500 ? 0 : 50)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        {order.totalAmount > 500 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          "₹50"
                        )}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <Badge variant="outline">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Estimated Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      {estimatedDelivery.toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {estimatedDelivery.toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Link to="/products" className="block">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Continue Shopping
                    </Button>
                  </Link>

                  <Link to="/" className="block">
                    <Button variant="outline" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    If you have any questions about your order, feel free to
                    contact us.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      fogandleaf@gmail.com
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      +91 97431 79631
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

// Add these functions inside the OrderConfirmationPage component, before the return statement
