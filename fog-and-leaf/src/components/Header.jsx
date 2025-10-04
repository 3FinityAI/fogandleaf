import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { ShoppingCart, User, Menu, X, Leaf, Package } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();

  // Use the reactive method instead of manual calculation
  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fog & Leaf</h1>
              <p className="text-xs text-green-600 -mt-1">Mist, Leaf, Magic</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 hover:text-green-600"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 hover:text-green-600"
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 hover:text-green-600"
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 hover:text-green-600"
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Track Order - Available for all users
            <Link to="/track-order">
              <Button variant="ghost" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            </Link> */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/order-history">
                  <Button variant="ghost" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </Button>
                </Link>
                <span className="text-sm text-gray-700">
                  Hello, {user?.firstName || "User"}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "text-green-600 font-semibold"
                      : "text-gray-700 hover:text-green-600"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "text-green-600 font-semibold"
                      : "text-gray-700 hover:text-green-600"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "text-green-600 font-semibold"
                      : "text-gray-700 hover:text-green-600"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "text-green-600 font-semibold"
                      : "text-gray-700 hover:text-green-600"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </NavLink>

              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Hello, {user?.name || "User"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
