import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import context providers
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";

// Import components
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import ProductsPage from "./components/ProductsPage";
import ProductDetailPage from "./components/ProductDetailPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import OrderConfirmationPage from "./components/OrderConfirmationPage";
import OrderHistoryPage from "./components/OrderHistoryPage";
import OrderTrackingPage from "./components/OrderTrackingPage";
import Returns from "./components/Returns";
import FAQ from "./components/FAQ";
import Support from "./components/Support";
import ShippingInfo from "./components/ShippingInfo";

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
  const { authLoading } = useAuth();

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <main className="flex-1">
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
