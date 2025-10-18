import { CustomerOrder, OrderProduct, Product, User } from "../models/index.js";
import { sendEmail } from "../services/email.service.js";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

// Create new order
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      items,
      totalAmount,
      subtotal,
      shippingCost = 0,
      taxAmount = 0,
      paymentMethod,
      shippingAddress,
      contactEmail,
      contactPhone,
      orderNotes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    // Validate user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create order
    const generateOrderNumber = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const prefix = `FOG${year}${month}`;

      // Find the highest sequence number for this month
      const lastOrder = await CustomerOrder.findOne({
        where: {
          orderNumber: {
            [Op.like]: `${prefix}%`,
          },
        },
        order: [["orderNumber", "DESC"]],
        transaction,
      });

      let sequence = 1;
      if (lastOrder && lastOrder.orderNumber) {
        // Extract sequence from last order number
        const lastSequence = parseInt(
          lastOrder.orderNumber.substring(prefix.length)
        );
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }

      // Format sequence to 4 digits (e.g., 0001, 0002, etc.)
      const sequenceStr = sequence.toString().padStart(4, "0");
      return `${prefix}${sequenceStr}`;
    };

    const orderNumber = await generateOrderNumber();

    const order = await CustomerOrder.create(
      {
        userId: req.user.id,
        orderNumber, // Explicitly set orderNumber
        status: "confirmed",
        totalAmount: parseFloat(totalAmount),
        subtotal: parseFloat(subtotal),
        shippingCost: parseFloat(shippingCost),
        taxAmount: parseFloat(taxAmount),
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
        // Shipping address
        shippingFirstName: shippingAddress.firstName,
        shippingLastName: shippingAddress.lastName,
        shippingAddress: shippingAddress.address,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPincode: shippingAddress.pincode,
        shippingCountry: shippingAddress.country || "India",
        // Contact info
        contactEmail,
        contactPhone,
        orderNotes: orderNotes || null,
      },
      { transaction }
    );

    // Create order items and validate stock
    const orderProducts = [];
    for (const item of items) {
      // Check if item has productId (from cart context) or id (direct product reference)
      const productId = item.productId || item.id;

      if (
        productId &&
        (typeof productId === "string" || typeof productId === "number")
      ) {
        // For existing products, validate against database
        const product = await Product.findByPk(productId);
        if (!product) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: `Product with ID ${productId} not found`,
          });
        }

        if (
          product.stockQuantity !== null &&
          product.stockQuantity < item.quantity
        ) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
          });
        }

        // Update stock if stockQuantity is tracked
        if (product.stockQuantity !== null) {
          await product.update(
            {
              stockQuantity: product.stockQuantity - item.quantity,
            },
            { transaction }
          );
        }

        orderProducts.push({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          productDescription: product.description,
          category: product.category,
          weight: product.weight,
          quantity: item.quantity,
          unitPrice: parseFloat(product.price),
          totalPrice: item.quantity * parseFloat(product.price),
          imageUrl: product.imageUrl,
        });
      } else {
        // For cart items without database product reference (fallback products)
        orderProducts.push({
          orderId: order.id,
          productId: null, // No product ID for cart-only items
          productName: item.name,
          productDescription: item.description || "",
          category: item.category || "tea",
          weight: item.weight || "100g",
          quantity: item.quantity,
          unitPrice: parseFloat(item.price),
          totalPrice: item.quantity * parseFloat(item.price),
          imageUrl: item.image || item.imageUrl || null,
        });
      }
    }

    // Create order products in bulk

    await OrderProduct.bulkCreate(orderProducts, { transaction });

    await transaction.commit();

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order, orderProducts, user);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    // Send WhatsApp notification
    try {
      const formattedPhone = contactPhone.startsWith("+")
        ? contactPhone
        : `+91${contactPhone}`;
      const whatsappResult = await sendWhatsAppMessage(
        formattedPhone,
        order.orderNumber,
        orderProducts.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
        })),
        order.totalAmount
      );

      if (whatsappResult.status === "logged") {
        // WhatsApp notification logged (credentials not configured)
      } else {
        // WhatsApp notification sent successfully
      }
    } catch (whatsappError) {
      console.error("Failed to send WhatsApp notification:", whatsappError);
      // Don't fail the order creation if WhatsApp fails
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Create order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: err.message,
    });
  }
};

// Get all orders for user
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await CustomerOrder.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderProduct,
          as: "products",
          include: [
            {
              model: Product,
              as: "product",
              required: false, // Left join since some order items might not have product references
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Transform data to match frontend expectations
    const transformedOrders = orders.map((order) => {
      const orderData = order.toJSON();

      return {
        id: orderData.id,
        status: orderData.status,
        total: orderData.totalAmount,
        order_date: orderData.createdAt,
        order_number: orderData.orderNumber,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shippingCost,
        tax_amount: orderData.taxAmount,
        shipping_address: {
          name: `${orderData.shippingFirstName} ${orderData.shippingLastName}`,
          address: orderData.shippingAddress,
          city: orderData.shippingCity,
          state: orderData.shippingState,
          pincode: orderData.shippingPincode,
          country: orderData.shippingCountry,
        },
        contact_email: orderData.contactEmail,
        contact_phone: orderData.contactPhone,
        order_notes: orderData.orderNotes,
        tracking_number: orderData.trackingNumber,
        estimated_delivery: orderData.estimatedDelivery,
        delivered_at: orderData.deliveredAt,
        // Transform products to items format expected by frontend
        items: orderData.products.map((product) => ({
          product_name: product.productName,
          product_description: product.productDescription,
          category: product.category,
          weight: product.weight,
          quantity: product.quantity,
          price: product.unitPrice,
          total_price: product.totalPrice,
          image_url: product.imageUrl,
        })),
      };
    });

    return res.json({
      success: true,
      data: transformedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: OrderProduct,
          as: "products",
          include: [
            {
              model: Product,
              as: "product",
              required: false,
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// Helper function to send order confirmation email
async function sendOrderConfirmationEmail(order, orderProducts, user) {
  const emailSubject = `Order Confirmation - ${order.orderNumber}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a27;">Order Confirmation</h2>
      
      <p>Dear ${user.firstname} ${user.lastname},</p>
      
      <p>Thank you for your order! We've received your order and will process it shortly.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(
          order.createdAt
        ).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
        <h3>Shipping Address</h3>
        <p>${order.shippingFirstName} ${order.shippingLastName}<br>
        ${order.shippingAddress}<br>
        ${order.shippingCity}, ${order.shippingState} ${
    order.shippingPincode
  }<br>
        ${order.shippingCountry}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
        <h3>Order Items</h3>
        ${orderProducts
          .map(
            (item) => `
          <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
            <p><strong>${item.productName}</strong></p>
            <p>Quantity: ${item.quantity} | Price: ₹${item.unitPrice} | Total: ₹${item.totalPrice}</p>
          </div>
        `
          )
          .join("")}
        
        <div style="margin-top: 20px; font-size: 18px;">
          <p><strong>Subtotal: ₹${order.subtotal}</strong></p>
          <p><strong>Shipping: ₹${order.shippingCost}</strong></p>
          <p><strong>Total: ₹${order.totalAmount}</strong></p>
        </div>
      </div>
      
      <p>We'll send you another email when your order ships.</p>
      
      <p>Thank you for choosing Fog & Leaf!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          If you have any questions about your order, please contact us at ${
            process.env.GMAIL_USER
          }
        </p>
      </div>
    </div>
  `;

  await sendEmail(order.contactEmail, emailSubject, "", emailHtml);
}

// Track order by tracking number or order number (public endpoint)
export const trackOrder = async (req, res) => {
  try {
    const { trackingId } = req.params; // Can be tracking number or order number

    if (!trackingId) {
      return res.status(400).json({
        success: false,
        message: "Tracking ID is required",
      });
    }

    // Search by tracking number first, then by order number
    let order = await CustomerOrder.findOne({
      where: {
        trackingNumber: trackingId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstname", "lastname", "email"],
        },
        {
          model: OrderProduct,
          as: "OrderProducts",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["name", "price", "weight"],
            },
          ],
        },
      ],
    });

    // If not found by tracking number, try order number
    if (!order) {
      order = await CustomerOrder.findOne({
        where: {
          orderNumber: trackingId,
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["firstname", "lastname", "email"],
          },
          {
            model: OrderProduct,
            as: "OrderProducts",
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["name", "price", "weight"],
              },
            ],
          },
        ],
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found. Please check your tracking number or order number.",
      });
    }

    // Format the response for tracking page
    const trackingData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,

      // Timestamps
      createdAt: order.createdAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,

      // Shipping address
      shippingFirstName: order.shippingFirstName,
      shippingLastName: order.shippingLastName,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPincode: order.shippingPincode,
      shippingCountry: order.shippingCountry,

      // Contact info
      contactEmail: order.contactEmail,
      contactPhone: order.contactPhone,

      // Order items
      OrderProducts: order.OrderProducts,

      // Customer info (limited for privacy)
      customer: {
        name: `${order.user?.firstname || ""} ${
          order.user?.lastname || ""
        }`.trim(),
      },
    };

    res.json({
      success: true,
      data: trackingData,
    });
  } catch (error) {
    console.error("Track order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track order",
    });
  }
};
