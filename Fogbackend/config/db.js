import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

(async () => {
  try {
    console.log(
      `Connecting to the "${process.env.DB_NAME}" database with Sequelize...`
    );
    await sequelize.authenticate();
    console.log(
      `✅ Successfully connected to the "${process.env.DB_NAME}" database.`
    );
  } catch (error) {
    console.error("❌ Error during database connection:", error.message);
    process.exit(1);
  }
})();

export default sequelize;
