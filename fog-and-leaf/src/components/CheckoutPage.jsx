import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../utility/axiosInstance";
// import ShippingOptions from "./ShippingOptions";
// import { calculateShippingCost } from "../utility/shippingCalculator";
import {
  CreditCard,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Coffee,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Billing Information
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",

    // Shipping Address
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",

    // Order Notes
    notes: "",

    // Payment Method
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('standard');
  // const [shippingCost, setShippingCost] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const orderPayload = {
        items: cartItems,
        totalAmount: calculateTotal(),
        subtotal: calculateSubtotal(),
        shippingCost: shippingCost,
        taxAmount: 0,
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country || "India",
        },
        contactEmail: formData.email,
        contactPhone: formData.phone,
        orderNotes: formData.notes,
      };

      // Send order to backend using axiosInstance (which handles cookies automatically)
      const response = await axiosInstance.post("/orders", orderPayload);
      console.log("Order response:", response.data);

      if (response.data.success) {
        // Store order info for confirmation page
        const orderData = {
          ...response.data.data,
          items: cartItems,
          shippingAddress: orderPayload.shippingAddress,
          contactEmail: orderPayload.contactEmail,
          contactPhone: orderPayload.contactPhone,
          totalAmount: orderPayload.totalAmount,
          paymentMethod: orderPayload.paymentMethod,
          orderDate: new Date().toISOString(),
        };

        console.log("Storing order data:", orderData);
        sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

        clearCart();
        console.log("Navigating to order confirmation page");
        navigate("/order-confirmation");
      } else {
        setErrors({
          general:
            response.data.message ||
            "Order processing failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Order submission error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Order processing failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
  };

  const shippingCost = calculateSubtotal() > 500 ? 0 : 50;
  const calculateTotal = () => calculateSubtotal() + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {errors.general}
                </div>
              )}

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`pl-10 ${
                            errors.email ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`pl-10 ${
                            errors.phone ? "border-red-500" : ""
                          }`}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`pl-10 ${
                            errors.address ? "border-red-500" : ""
                          }`}
                          placeholder="House number, street name, area"
                          rows={3}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={errors.city ? "border-red-500" : ""}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={errors.state ? "border-red-500" : ""}
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className={errors.pincode ? "border-red-500" : ""}
                          placeholder="6-digit pincode"
                        />
                        {errors.pincode && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.pincode}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping Options - Commented out for future use */}
              {/*
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <ShippingOptions
                  cartItems={cartItems}
                  shippingAddress={formData}
                  selectedOption={selectedDeliveryOption}
                  onOptionSelect={handleDeliveryOptionChange}
                />
              </motion.div>
              */}

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="cod"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === "cod"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label
                          htmlFor="cod"
                          className="text-sm font-medium text-gray-700"
                        >
                          Cash on Delivery (COD)
                        </label>
                      </div>

                      <div className="flex items-center space-x-2 opacity-50">
                        <input
                          type="radio"
                          id="online"
                          name="paymentMethod"
                          value="online"
                          disabled
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label
                          htmlFor="online"
                          className="text-sm font-medium text-gray-700"
                        >
                          Online Payment (Coming Soon)
                        </label>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Lock className="h-5 w-5 text-blue-600 mr-2" />
                          <p className="text-sm text-blue-800">
                            Pay securely when your order arrives at your
                            doorstep
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </motion.div>
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
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Coffee className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    <hr className="border-gray-200" />

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{calculateSubtotal()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `₹${shippingCost}`
                          )}
                        </span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-600">
                          ₹{calculateTotal()}
                        </span>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-6"
                      size="lg"
                    >
                      {isLoading ? "Processing Order..." : "Place Order"}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By placing your order, you agree to our Terms of Service
                      and Privacy Policy
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
