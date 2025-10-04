import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utility/axiosInstance.js";

// Create Cart Context
const CartContext = createContext();

// Simple utility to parse weight to number only
const parseWeightToNumber = (weightString) => {
  if (!weightString) return 0;
  // Extract number from strings like "100g", "250g", "1kg", or just "100"
  const match = weightString.toString().match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

export const CartProvider = ({ children }) => {
  // Cart state - matching App.jsx structure
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get authentication status from localStorage or context
  const isAuthenticated = !!localStorage.getItem("token");

  // Helper function to transform backend cart items to frontend format
  const transformBackendItems = React.useCallback((backendItems) => {
    return backendItems.map((item) => ({
      id: item.productId,
      productId: item.productId,
      name: item.productName,
      price: parseFloat(item.productPrice),
      image: item.productImage,
      imageUrl: item.productImage,
      quantity: item.quantity,
      weight: parseWeightToNumber(item.productWeight), // Always store as number
      weightOriginal: item.productWeight, // Keep original format for backend compatibility
      category: item.productCategory,
    }));
  }, []);

  // Helper function to transform frontend items for backend (unused but kept for future use)
  // const transformForBackend = (frontendItem) => ({
  //   productId: frontendItem.id || frontendItem.productId,
  //   quantity: frontendItem.quantity,
  // });

  // Calculate cart total - matches App.jsx logic
  const updateCartTotal = React.useCallback(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(total);
  }, [cartItems]);

  // Update total whenever cartItems change
  useEffect(() => {
    updateCartTotal();
  }, [updateCartTotal]);

  // Load cart data
  const loadCart = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Load from backend
        const response = await axiosInstance.get("/cart");
        const backendItems = response.data.data?.items || [];
        const transformedItems = transformBackendItems(backendItems);
        setCartItems(transformedItems);
      } else {
        // Load from localStorage
        const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        setCartItems(localCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setError("Failed to load cart");
      // Fallback to localStorage
      const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartItems(localCart);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, transformBackendItems]);

  // Load cart on component mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Add to cart function - matches App.jsx signature
  const addToCart = async (product, quantity = 1) => {
    setError(null);

    // Stock validation
    const availableStock = product.stockQuantity || 0;
    const existingItem = cartItems.find(
      (item) => item.id === product.id || item.productId === product.id
    );
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentCartQuantity + quantity;

    if (totalQuantity > availableStock) {
      setError(
        `Cannot add to cart. Only ${availableStock} items available in stock. You currently have ${currentCartQuantity} in cart.`
      );
      return;
    }

    // Optimistic update for immediate UI response
    let updatedItems;

    if (existingItem) {
      updatedItems = cartItems.map((item) =>
        item.id === product.id || item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const newItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || product.image,
        imageUrl: product.imageUrl || product.image,
        quantity: quantity,
        weight: parseWeightToNumber(product.weight), // Store as number
        weightOriginal: product.weight, // Keep original format for backend
        category: product.category,
        stockQuantity: product.stockQuantity, // Store stock info for validation
      };
      updatedItems = [...cartItems, newItem];
    }

    setCartItems(updatedItems);

    try {
      if (isAuthenticated) {
        // Sync with backend
        await axiosInstance.post("/cart/add", {
          productId: product.id,
          quantity: quantity,
        });
      } else {
        // Save to localStorage for guest users
        localStorage.setItem("guestCart", JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart");
      // Revert optimistic update on failure
      loadCart();
    }
  };

  // Remove from cart function - matches App.jsx signature
  const removeFromCart = async (productId) => {
    setError(null);

    // Optimistic update
    const updatedItems = cartItems.filter(
      (item) => item.id !== productId && item.productId !== productId
    );
    setCartItems(updatedItems);

    try {
      if (isAuthenticated) {
        // Sync with backend
        await axiosInstance.delete(`/cart/remove/${productId}`);
      } else {
        // Update localStorage for guest users
        localStorage.setItem("guestCart", JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      setError("Failed to remove item from cart");
      // Revert optimistic update on failure
      loadCart();
    }
  };

  // Update quantity function - matches App.jsx logic
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setError(null);

    // Find the cart item to get stock information
    const cartItem = cartItems.find(
      (item) => item.id === productId || item.productId === productId
    );

    if (
      cartItem &&
      cartItem.stockQuantity &&
      quantity > cartItem.stockQuantity
    ) {
      setError(
        `Cannot update quantity. Only ${cartItem.stockQuantity} items available in stock.`
      );
      return;
    }

    // Optimistic update
    const updatedItems = cartItems.map((item) =>
      item.id === productId || item.productId === productId
        ? { ...item, quantity }
        : item
    );
    setCartItems(updatedItems);

    try {
      if (isAuthenticated) {
        // Sync with backend
        await axiosInstance.put("/cart/update", {
          productId: productId,
          quantity: quantity,
        });
      } else {
        // Update localStorage for guest users
        localStorage.setItem("guestCart", JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update item quantity");
      // Revert optimistic update on failure
      loadCart();
    }
  };

  // Clear cart function - matches App.jsx signature
  const clearCart = async () => {
    setError(null);

    // Optimistic update
    setCartItems([]);

    try {
      if (isAuthenticated) {
        // Clear backend cart
        await axiosInstance.delete("/cart/clear");
      } else {
        // Clear localStorage for guest users
        localStorage.removeItem("guestCart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError("Failed to clear cart");
      // Revert optimistic update on failure
      loadCart();
    }
  };

  // Merge guest cart with user cart after login
  const mergeGuestCartOnLogin = async () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

      if (guestCart.length > 0) {
        // Transform guest cart items for backend
        const guestCartItems = guestCart.map((item) => ({
          productId: item.id || item.productId,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          image: item.image || item.imageUrl,
          weight: item.weight,
          category: item.category,
        }));

        // Send to backend for merging
        await axiosInstance.post("/cart/merge", { guestCartItems });

        // Clear guest cart from localStorage
        localStorage.removeItem("guestCart");

        // Reload cart from backend
        await loadCart();
      }
    } catch (error) {
      console.error("Error merging guest cart:", error);
      setError("Failed to merge guest cart");
    }
  };

  // Utility functions for backward compatibility
  const getCartTotal = () => cartTotal;
  const getCartItemCount = () =>
    cartItems.reduce((count, item) => count + item.quantity, 0);
  const getCartItem = (productId) =>
    cartItems.find(
      (item) => item.id === productId || item.productId === productId
    );

  // Utility function for weight display formatting
  const formatWeightDisplay = (weight) => {
    if (typeof weight === "number") {
      return `${weight}g`; // Simple template literal formatting
    }
    if (typeof weight === "string" && weight.includes("g")) {
      return weight; // Already formatted
    }
    return `${weight || 0}g`;
  };

  const value = {
    cartItems,
    cartTotal,
    isLoading,
    error,

    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    loadCart,
    mergeGuestCartOnLogin,

    // Utility functions
    getCartTotal,
    getCartItemCount,
    getCartItem,
    formatWeightDisplay,

    items: cartItems,
    total: cartTotal,
    itemCount: getCartItemCount(),
    loading: isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
