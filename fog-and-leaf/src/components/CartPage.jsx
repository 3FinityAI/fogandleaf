import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Coffee,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
  };

  const shippingCost = calculateSubtotal() > 500 ? 0 : 50;
  const totalWithShipping = calculateSubtotal() + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any teas to your cart yet. Explore our
            premium collection and find your perfect blend.
          </p>
          <div className="space-y-4">
            <Link to="/products">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Shop Our Teas
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/products"
                className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <Coffee
                          className={`h-12 w-12 text-green-600 ${
                            item.image ? "hidden" : "block"
                          }`}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.category} • {item.weight}
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-2">
                          ₹{item.price}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ₹{calculateSubtotal().toFixed(2)}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${shippingCost}`
                        )}
                      </span>
                    </div>

                    {/* Free shipping notice */}
                    {shippingCost > 0 && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        Add ₹{(500 - calculateSubtotal()).toFixed(2)} more for
                        free shipping!
                      </div>
                    )}

                    <hr className="border-gray-200" />

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">
                        ₹{totalWithShipping.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isAuthenticated
                      ? "Proceed to Checkout"
                      : "Login to Checkout"}
                  </Button>

                  {/* Security Notice */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      🔒 Secure checkout with SSL encryption
                    </p>
                  </div>

                  {/* Continue Shopping */}
                  <Link to="/products" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Have a promo code?
                  </h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
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

export default CartPage;
