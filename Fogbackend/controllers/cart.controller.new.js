// Simple cart controller - JWT only approach
import { Cart, Product } from "../models/index.js";

// Get user's cart (requires authentication)
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]],
    });

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.productPrice);
    }, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        total: total.toFixed(2),
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if item already in cart
    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      await existingCartItem.update({ quantity: newQuantity });

      return res.json({
        success: true,
        message: "Cart updated successfully",
        data: existingCartItem,
      });
    } else {
      // Create new cart item
      const cartItem = await Cart.create({
        userId,
        productId,
        quantity,
        productName: product.name,
        productPrice: product.price,
        productImage: product.imageUrl,
        productWeight: product.weight,
        productCategory: product.category,
      });

      return res.status(201).json({
        success: true,
        message: "Item added to cart",
        data: cartItem,
      });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cartItem = await Cart.findOne({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    await cartItem.update({ quantity });

    res.json({
      success: true,
      message: "Cart item updated",
      data: cartItem,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cartItem = await Cart.findOne({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.destroy({
      where: { userId },
    });

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};
