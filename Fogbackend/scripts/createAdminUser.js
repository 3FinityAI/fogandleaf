import sequelize from "../config/db.js";
import { User } from "../models/index.js";

const createAdminUser = async () => {
  try {
    console.log("🔧 Connecting to database...");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@fogandleaf.com" },
    });

    if (existingAdmin) {
      console.log(
        "⚠️  Admin user already exists with email: admin@fogandleaf.com"
      );
      console.log("📋 Admin User Details:");
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(
        `   Name: ${existingAdmin.firstname} ${existingAdmin.lastname || ""}`
      );
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      return;
    }

    console.log("👤 Creating admin user...");

    // Create admin user (password will be automatically hashed by the User model hook)
    const adminUser = await User.create({
      email: "admin@fogandleaf.com",
      firstname: "Admin",
      lastname: "User",
      password: "admin123", // Plain password - will be hashed automatically
      role: "admin",
      provider: "local",
      providerId: null,
      avatar: null,
      refreshToken: null,
    });

    console.log("🎉 Admin user created successfully!");
    console.log("📋 Admin User Details:");
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.firstname} ${adminUser.lastname}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    console.log("");
    console.log("🔐 Login Credentials:");
    console.log("   Email: admin@fogandleaf.com");
    console.log("   Password: admin123");
    console.log("");
    console.log(
      "⚠️  IMPORTANT: Please change the default password after first login!"
    );
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);

    if (error.name === "SequelizeValidationError") {
      console.log("📝 Validation errors:");
      error.errors.forEach((err) => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      console.log("📝 A user with this email already exists!");
    }
  } finally {
    console.log("🔌 Closing database connection...");
    await sequelize.close();
  }
};

// Run the script
createAdminUser();
