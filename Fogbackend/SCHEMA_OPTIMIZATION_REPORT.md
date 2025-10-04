# FOG AND LEAF E-COMMERCE SCHEMA ANALYSIS & OPTIMIZATION REPORT

## Date: September 25, 2025

## 📊 CURRENT SCHEMA ANALYSIS

### ✅ STRENGTHS

1. **Proper UUIDs for Users/Orders** - Good for security & scalability
2. **Comprehensive Order Tracking** - Full shipping, payment, status fields
3. **Stock Movement Audit Trail** - Excellent for inventory management
4. **Flexible Authentication** - Supports local + OAuth providers
5. **Transaction Safety** - Order creation uses database transactions
6. **Sequential Order Numbers** - Human-readable format (FOG202509XXXX)

### ⚠️ ISSUES IDENTIFIED

#### 1. **EXCESSIVE DENORMALIZATION**

- `Cart` model stores: productName, productPrice, productImage, productWeight, productCategory
- `OrderProduct` model stores: productName, productDescription, category, weight, imageUrl
- `StockMovement` model stores: productName, supplierName, userName

#### 2. **INCONSISTENT DATA TYPES**

- `Product.weight` is DECIMAL but `OrderProduct.weight` is STRING
- `Product.price` vs `OrderProduct.unitPrice` naming inconsistency

#### 3. **FOREIGN KEY CONSTRAINTS DISABLED**

- All relationships use `constraints: false` - risky for data integrity

#### 4. **REDUNDANT VALIDATIONS**

- Same validation logic repeated across models

#### 5. **MISSING INDEXES**

- Some critical queries lack proper indexing

## 🎯 OPTIMAL SCHEMA DESIGN RECOMMENDATION

### CORE PRINCIPLE: **STRATEGIC DENORMALIZATION**

- Denormalize ONLY frequently changing, business-critical data
- Normalize everything else with proper JOINs
- Maintain referential integrity

---

## 📋 OPTIMIZED MODELS

### 1. **USERS** (Minimal Changes)

```javascript
// Current design is good - keep as is
// ✅ UUIDs for security
// ✅ OAuth support
// ✅ Proper validation
```

### 2. **PRODUCTS** (Minor Optimization)

```javascript
// Add missing indexes, standardize weight format
weight: {
  type: DataTypes.STRING, // Changed from DECIMAL to STRING for consistency
  allowNull: false,
  comment: "Weight with unit (e.g., '100g', '250g')",
  validate: {
    isWeightFormat(value) {
      if (!/^\d+[a-zA-Z]+$/.test(value)) {
        throw new Error('Weight must be in format like "100g", "250g"');
      }
    }
  }
}
```

### 3. **CART** (Major Simplification)

```javascript
// REMOVE: productName, productPrice, productImage, productWeight, productCategory
// REASON: These rarely change, can be fetched via JOIN
const Cart = {
  id: UUID,
  userId: UUID, // ✅ Keep - FK to user
  productId: INTEGER, // ✅ Keep - FK to product
  quantity: INTEGER, // ✅ Keep - cart-specific data
  addedAt: DATE, // ✅ Add - useful for cart expiry
  // All other product data fetched via JOIN with Product table
};
```

### 4. **ORDER_PRODUCTS** (Strategic Denormalization)

```javascript
// KEEP: Business-critical historical data only
const OrderProduct = {
  id: UUID,
  orderId: UUID, // ✅ Keep - FK
  productId: INTEGER, // ✅ Keep - FK (nullable for deleted products)

  // BUSINESS-CRITICAL HISTORICAL DATA
  productName: STRING, // ✅ Keep - names change
  unitPrice: DECIMAL, // ✅ Keep - prices change frequently
  quantity: INTEGER, // ✅ Keep - order-specific

  // OPTIONAL HISTORICAL PRESERVATION
  primaryImageUrl: STRING, // ✅ Keep single image, not array

  // REMOVE THESE - Get via JOIN when needed:
  // ❌ productDescription (rarely changes)
  // ❌ category (rarely changes)
  // ❌ weight (rarely changes)
  // ❌ full imageUrl array (too much data)
};
```

### 5. **STOCK_MOVEMENTS** (Moderate Cleanup)

```javascript
// KEEP: productName, supplierName, userName for audit trail
// REMOVE: None - audit tables need historical accuracy
```

### 6. **CUSTOMER_ORDERS** (Keep Current Design)

```javascript
// Current design is excellent - comprehensive and well-structured
```

---

## 🔄 OPTIMIZED DATA FLOWS

### **Cart Management Flow**

```javascript
// OLD: Store all product data in cart
const addToCart = async (userId, productId, quantity) => {
  const product = await Product.findByPk(productId);
  await Cart.create({
    userId,
    productId,
    quantity,
    productName: product.name, // ❌ REDUNDANT
    productPrice: product.price, // ❌ REDUNDANT
    productImage: product.imageUrl[0], // ❌ REDUNDANT
  });
};

// NEW: Minimal cart data + JOIN for display
const addToCart = async (userId, productId, quantity) => {
  await Cart.create({
    userId,
    productId,
    quantity,
    addedAt: new Date(),
  });
};

const getCartItems = async (userId) => {
  return await Cart.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        as: "product",
        attributes: [
          "name",
          "price",
          "imageUrl",
          "weight",
          "category",
          "stockQuantity",
        ],
      },
    ],
  });
};
```

### **Order Creation Flow** (Optimized)

```javascript
const createOrder = async (cartItems) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Create order
    const order = await CustomerOrder.create(orderData, { transaction });

    // 2. Create order products with strategic denormalization
    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);

      await OrderProduct.create(
        {
          orderId: order.id,
          productId: product.id,

          // ✅ BUSINESS-CRITICAL: Store these for historical accuracy
          productName: product.name, // Names can change
          unitPrice: product.price, // Prices change frequently
          primaryImageUrl: product.imageUrl[0], // Keep one image
          quantity: item.quantity,

          // ❌ DON'T STORE: Get via JOIN when needed
          // category: product.category,       // JOIN Product table
          // weight: product.weight,           // JOIN Product table
          // description: product.description, // JOIN Product table
        },
        { transaction }
      );

      // Update stock
      await product.decrement("stockQuantity", {
        by: item.quantity,
        transaction,
      });
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

---

## 📈 PERFORMANCE OPTIMIZATIONS

### **Critical Indexes to Add**

```sql
-- Cart optimizations
CREATE INDEX idx_cart_user_product ON carts(user_id, product_id);
CREATE INDEX idx_cart_added_at ON carts(added_at); -- For cart cleanup

-- Order optimizations
CREATE INDEX idx_orders_user_status ON customer_orders(user_id, status);
CREATE INDEX idx_orders_created_status ON customer_orders(created_at, status);

-- OrderProduct optimizations
CREATE INDEX idx_orderproduct_order_product ON order_products(order_id, product_id);

-- Stock Movement optimizations
CREATE INDEX idx_stock_product_date ON stock_movements(product_id, created_at);
CREATE INDEX idx_stock_type_date ON stock_movements(movement_type, created_at);
```

### **Query Optimizations**

```javascript
// Instead of storing redundant data, use efficient JOINs
const getOrderDetails = async (orderId) => {
  return await CustomerOrder.findByPk(orderId, {
    include: [
      {
        model: OrderProduct,
        as: "products",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["category", "weight", "description", "imageUrl"],
            required: false, // LEFT JOIN for deleted products
          },
        ],
      },
    ],
  });
};
```

---

## 🛡️ DATA INTEGRITY IMPROVEMENTS

### **Enable Foreign Key Constraints**

```javascript
// CHANGE: constraints: false → constraints: true
Customer Order.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: true, // ✅ Enable for data integrity
  onDelete: 'RESTRICT', // Prevent user deletion with orders
  onUpdate: 'CASCADE'
});

OrderProduct.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
  constraints: true,
  onDelete: 'SET NULL', // Allow product deletion, keep order history
  onUpdate: 'CASCADE'
});
```

### **Add Data Validation Triggers**

```sql
-- Ensure order totals match sum of order products
CREATE OR REPLACE FUNCTION validate_order_total()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT SUM(total_price) FROM order_products WHERE order_id = NEW.id) != NEW.total_amount THEN
    RAISE EXCEPTION 'Order total mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_total_validation
  AFTER INSERT OR UPDATE ON customer_orders
  FOR EACH ROW EXECUTE FUNCTION validate_order_total();
```

---

## 💾 STORAGE REDUCTION ESTIMATE

### **Before Optimization:**

- Cart: ~150 bytes per item (redundant product data)
- OrderProduct: ~300 bytes per item (excessive denormalization)

### **After Optimization:**

- Cart: ~50 bytes per item (**66% reduction**)
- OrderProduct: ~120 bytes per item (**60% reduction**)

### **Overall Benefits:**

- 🔸 **60-70% storage reduction** for cart and order tables
- 🔸 **Faster queries** with proper indexing
- 🔸 **Data consistency** with FK constraints
- 🔸 **Maintains business requirements** for historical accuracy
- 🔸 **Improved maintainability** with normalized design

---

## 🚀 IMPLEMENTATION PLAN

### **Phase 1: Low Risk Changes**

1. Add missing indexes
2. Enable FK constraints
3. Standardize data types (weight format)

### **Phase 2: Schema Optimization**

1. Create optimized models
2. Migration script for data transformation
3. Update controller logic for JOINs

### **Phase 3: Performance Validation**

1. Load testing
2. Query performance analysis
3. Storage usage monitoring

---

## ✅ FINAL RECOMMENDATION

**Implement the HYBRID APPROACH** with strategic denormalization:

1. **Cart**: Normalize completely (60%+ storage savings)
2. **OrderProduct**: Keep only business-critical historical data
3. **Enable FK constraints** for data integrity
4. **Add proper indexing** for performance
5. **Maintain audit trails** in StockMovement

This design achieves the **perfect balance** between:

- ✅ **Storage efficiency** (60-70% reduction)
- ✅ **Query performance** (proper JOINs + indexes)
- ✅ **Business requirements** (historical accuracy preserved)
- ✅ **Data integrity** (FK constraints enabled)
- ✅ **Maintainability** (normalized design patterns)

**Would you like me to implement these optimizations step by step?** 🎯
