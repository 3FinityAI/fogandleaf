import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "../utility/axiosInstance";
import {
  Package,
  Calendar,
  Coffee,
  Eye,
  Download,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";

const OrderHistoryPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState([]);

  const location = useLocation();
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/orders");
        console.log(response.data);
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 401) {
          logout();
        }
      }
    };
    fetchOrders();
  }, [isAuthenticated, logout]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your order history.
          </p>
          <Link to="/login">
            <Button className="bg-green-600 hover:bg-green-700">
              Login to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Package className="h-16 w-16 mx-auto mb-4 text-green-200" />
            <h1 className="text-4xl font-bold mb-4">Order History</h1>
            <p className="text-xl text-green-100">
              Track your tea journey with us
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start your tea journey today!
            </p>
            <Link to="/products">
              <Button className="bg-green-600 hover:bg-green-700">
                Explore Our Teas
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Your Orders ({orders.length})
              </h2>
              <Link to="/products">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shop Again
                </Button>
              </Link>
            </motion.div>

            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            Order #{order.order_number}
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(order.order_date)}
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {order.items.length} item
                              {order.items.length > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`${getStatusColor(order.status)} mb-2`}
                          >
                            <span className="flex items-center">
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">
                                {order.status}
                              </span>
                            </span>
                          </Badge>
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{order.total}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Order Items */}
                      <div className="space-y-3 mb-6">
                        {order.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Coffee className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {item.product_name}
                              </h4>
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

                      {/* Shipping Address */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Shipping Address
                        </h4>
                        <p className="text-sm text-gray-700">
                          {order.shipping_address.name}
                          <br />
                          {order.shipping_address.address}
                          <br />
                          {order.shipping_address.city},{" "}
                          {order.shipping_address.state}{" "}
                          {order.shipping_address.pincode}
                        </p>
                      </div>

                      {/* Actions */}
                      {/* <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                        {order.status === 'delivered' && (
                          <Link to="/products">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Reorder
                            </Button>
                          </Link>
                        )}
                      </div> */}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
