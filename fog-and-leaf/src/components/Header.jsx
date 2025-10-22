import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { ShoppingCart, User, Menu, X, Leaf, Package } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isInitialAuthCheck } = useAuth();
  const { getCartItemCount } = useCart();

  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Fixed Size */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-2 rounded-lg">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                Fog & Leaf
              </h1>
              <p className="text-xs text-green-600 -mt-1 whitespace-nowrap">
                Mist, Leaf, Magic
              </p>
            </div>
            {/* Mobile Logo Text */}
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-900 whitespace-nowrap">
                Fog & Leaf
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors text-sm xl:text-base ${
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
                `transition-colors text-sm xl:text-base ${
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
                `transition-colors text-sm xl:text-base ${
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
                `transition-colors text-sm xl:text-base ${
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
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {isInitialAuthCheck ? (
              // Show skeleton while checking auth
              <>
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              </>
            ) : isAuthenticated ? (
              <>
                <Link to="/order-history">
                  <Button variant="ghost" size="sm" className="text-sm">
                    <Package className="h-4 w-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">My Orders</span>
                    <span className="xl:hidden">Orders</span>
                  </Button>
                </Link>
                <span className="text-sm text-gray-700 max-w-[100px] truncate">
                  Hi, {user?.firstName || "User"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    <User className="h-4 w-4 mr-1 xl:mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Tablet Navigation (md to lg) */}
          <nav className="hidden md:flex lg:hidden items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors text-sm ${
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
                `transition-colors text-sm ${
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
                `transition-colors text-sm ${
                  isActive
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 hover:text-green-600"
                }`
              }
            >
              About
            </NavLink>
          </nav>

          {/* Tablet Actions (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            {isAuthenticated && (
              <Link to="/order-history">
                <Button variant="ghost" size="sm">
                  <Package className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
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

          {/* Mobile menu button and cart */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
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

        {/* Mobile/Tablet Dropdown Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3">
              {/* Main Navigation Links */}
              <div className="space-y-3">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-md transition-colors text-sm ${
                      isActive
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-md transition-colors text-sm ${
                      isActive
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-md transition-colors text-sm ${
                      isActive
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-md transition-colors text-sm ${
                      isActive
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </NavLink>

                {/* My Orders - Show for authenticated users */}
                {isAuthenticated && (
                  <NavLink
                    to="/order-history"
                    className={({ isActive }) =>
                      `block py-2 px-3 rounded-md transition-colors text-sm ${
                        isActive
                          ? "bg-green-50 text-green-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </div>
                  </NavLink>
                )}
              </div>

              {/* User Actions Section */}
              <div className="pt-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-green-50 rounded-md">
                      <p className="text-sm text-gray-700 font-medium">
                        Hello, {user?.firstName || user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-center text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center text-sm"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-sm"
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
