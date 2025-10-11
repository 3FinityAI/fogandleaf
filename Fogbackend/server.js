import express from "express";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";
// Import all models to ensure proper synchronization
import "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import emailRoutes from "./routes/email.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import logger from "./middleware/logger.js";
import adminRoutes from "./routes/admin.route.js";
import shippingRoutes from "./routes/shipping.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL1, // Main frontend
      process.env.FRONTEND_URL2, // Admin frontend
    ],
    credentials: true, // allow cookies (for refresh token)
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Add cookie parser middleware

// Logging middleware
app.use(logger);

// Passport config
import "./config/passport.js";
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/shipments", shippingRoutes);
app.use("/api/admin/reports", reportsRoutes);

// Start server
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    console.log("🔄 Synchronizing database...");

    // First, ensure all models are defined and relationships are set
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Use force: false and alter: false to avoid enum issues
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Database synchronized successfully");

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    console.error("Error details:", error.original || error.message);

    // If sync fails, try without alter
    try {
      console.log("🔄 Trying basic sync...");
      await sequelize.sync();
      console.log("✅ Database synchronized with basic sync");
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (retryError) {
      console.error("❌ Basic sync also failed:", retryError);
      process.exit(1);
    }
  }
};

startServer();
