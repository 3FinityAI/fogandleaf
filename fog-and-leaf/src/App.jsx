import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import context providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Import components
import Header from "./components/Header";
import Footer from "./components/Footer";
import React, { lazy, Suspense } from "react";
import HomePage from "./components/HomePage";
const AboutPage = lazy(() => import("./components/AboutPage"));
const ProductsPage = lazy(() => import("./components/ProductsPage"));
const ProductDetailPage = lazy(() => import("./components/ProductDetailPage"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const SignupPage = lazy(() => import("./components/SignupPage"));
const CartPage = lazy(() => import("./components/CartPage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const OrderConfirmationPage = lazy(() =>
  import("./components/OrderConfirmationPage")
);
const OrderHistoryPage = lazy(() => import("./components/OrderHistoryPage"));
const OrderTrackingPage = lazy(() => import("./components/OrderTrackingPage"));
const Returns = lazy(() => import("./components/Returns"));
const FAQ = lazy(() => import("./components/FAQ"));
const Support = lazy(() => import("./components/Support"));
const ShippingInfo = lazy(() => import("./components/ShippingInfo"));

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Main app content component
const AppContent = () => {
  // Remove blocking auth check - app renders immediately
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmationPage />}
              />
              <Route path="/order-history" element={<OrderHistoryPage />} />
              {/* <Route path="/track-order" element={<OrderTrackingPage />} /> */}
              <Route path="/shipping" element={<ShippingInfo />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Support />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
