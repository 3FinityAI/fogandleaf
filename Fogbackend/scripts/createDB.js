// scripts/setupTables.js
import dotenv from "dotenv";
dotenv.config();

// Import sequelize instance AFTER dotenv
import sequelize from "../config/db.js";

// Import models to register them
import "../models/users.model.js";
import "../models/products.model.js";
import "../models/cart.model.js";
import "../models/customerorder.model.js";
import "../models/orderproduct.model.js";
import "../models/stockmovement.model.js";

const setupTables = async () => {
  try {
    console.log(`🔌 Connecting to database "${process.env.DB_NAME}"...`);
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    console.log("🏗️ Dropping & creating all tables...");
    await sequelize.sync({ force: true }); // force:true = drop + create all tables
    console.log("✅ All tables created successfully.");

    console.log(`
📋 Tables Created:
  - users
  - products
  - cart
  - customer_orders
  - order_products
`);

    console.log("🎉 Table setup completed successfully!");
  } catch (error) {
    console.error("❌ Error during table setup:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

setupTables();
