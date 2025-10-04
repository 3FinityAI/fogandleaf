// OPTIMIZED Cart Controller - Works with same table names, uses JOINs for efficiency
import { Cart, Product } from "../models/index.js";

// Get user's cart (OPTIMIZED - uses JOIN instead of redundant data)
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // OPTIMIZED: Get cart items with product data via JOIN
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "price",
            "imageUrl",
            "weight",
            "category",
            "stockQuantity",
            "isActive",
          ],
          where: { isActive: true },
          required: true, // INNER JOIN - only active products
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Calculate total from product data (not redundant cart data)
    const total = cartItems.reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.product.price);
    }, 0);

    const itemCount = cartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        items: cartItems,
        total: total.toFixed(2),
        itemCount,
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

// Merge guest cart with user cart after login (OPTIMIZED)
export const mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { guestCartItems } = req.body;

    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest cart data",
      });
    }

    const mergedItems = [];

    for (const guestItem of guestCartItems) {
      const { productId, quantity } = guestItem;

      // Validate product exists
      const product = await Product.findOne({
        where: { id: productId, isActive: true },
      });

      if (!product) continue; // Skip invalid products

      // Check if item already exists in user's cart
      const existingCartItem = await Cart.findOne({
        where: { userId, productId },
      });

      if (existingCartItem) {
        // Update quantity (add guest quantity to existing)
        const newQuantity = existingCartItem.quantity + quantity;
        await existingCartItem.update({
          quantity: newQuantity,
          addedAt: new Date(), // Update timestamp
        });

        // Load with product data for response
        const updatedItem = await Cart.findByPk(existingCartItem.id, {
          include: [{ model: Product, as: "product" }],
        });
        mergedItems.push(updatedItem);
      } else {
        // OPTIMIZED: Create new cart item with minimal data
        const cartItem = await Cart.create({
          userId,
          productId,
          quantity,
          addedAt: new Date(),
        });

        // Load with product data for response
        const newItem = await Cart.findByPk(cartItem.id, {
          include: [{ model: Product, as: "product" }],
        });
        mergedItems.push(newItem);
      }
    }

    res.json({
      success: true,
      message: "Guest cart merged successfully",
      data: {
        mergedItems: mergedItems.length,
        items: mergedItems,
      },
    });
  } catch (error) {
    console.error("Merge guest cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to merge guest cart",
    });
  }
};

// Add item to cart (OPTIMIZED - no redundant data storage)
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is active
    const product = await Product.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stockQuantity}`,
      });
    }

    // Check if item already in cart
    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > 50) {
        return res.status(400).json({
          success: false,
          message: "Cannot add more than 50 items of the same product",
        });
      }

      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Total would be ${newQuantity}, but only ${product.stockQuantity} available`,
        });
      }

      await existingCartItem.update({
        quantity: newQuantity,
        addedAt: new Date(),
      });

      // Get updated item with product data
      cartItem = await Cart.findByPk(existingCartItem.id, {
        include: [{ model: Product, as: "product" }],
      });

      return res.json({
        success: true,
        message: "Cart updated successfully",
        data: cartItem,
      });
    } else {
      // OPTIMIZED: Create new cart item with only essential data
      const newCartItem = await Cart.create({
        userId,
        productId,
        quantity,
        addedAt: new Date(),
      });

      // Get cart item with product data for response
      cartItem = await Cart.findByPk(newCartItem.id, {
        include: [{ model: Product, as: "product" }],
      });

      return res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: cartItem,
      });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

// Update cart item quantity (OPTIMIZED)
export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1 || quantity > 50) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 50",
      });
    }

    // Get cart item with product info
    const cartItem = await Cart.findOne({
      where: { id: cartItemId, userId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["stockQuantity", "name", "isActive"],
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (!cartItem.product.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product is no longer available",
      });
    }

    // Check stock availability
    if (cartItem.product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${cartItem.product.name}. Available: ${cartItem.product.stockQuantity}`,
      });
    }

    await cartItem.update({ quantity });

    // Return updated cart item with product data
    const updatedCartItem = await Cart.findByPk(cartItemId, {
      include: [{ model: Product, as: "product" }],
    });

    res.json({
      success: true,
      message: "Cart item updated successfully",
      data: updatedCartItem,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id: cartItemId, userId },
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
    console.error("Remove cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
      error: error.message,
    });
  }
};

// Remove item from cart (alias for compatibility)
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { userId, productId },
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
      error: error.message,
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedCount = await Cart.destroy({
      where: { userId },
    });

    res.json({
      success: true,
      message: `Cleared ${deletedCount} items from cart`,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
