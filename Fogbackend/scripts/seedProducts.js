// scripts/seedProducts.js
import dotenv from "dotenv";
dotenv.config();

import sequelize from "../config/db.js";
import Product from "../models/products.model.js";
import productData from "../data/ProductData.js"; // adjust path if different

const seedProducts = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    console.log("🌱 Seeding products...");

    let createdCount = 0;
    let existingCount = 0;

    // Loop through productData array
    for (const product of productData) {
      const existing = await Product.findOne({ where: { name: product.name } });

      if (!existing) {
        await Product.create(product.filter((_, key) => key !== "id"));
        console.log(`   ✓ Created: ${product.name}`);
        createdCount++;
      } else {
        console.log(`   - Exists: ${product.name}`);
        existingCount++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Created: ${createdCount}`);
    console.log(`   ℹ️ Existing: ${existingCount}`);
    console.log(`   📦 Total products processed: ${productData.length}`);

    console.log("\n🎉 Product seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

seedProducts();
