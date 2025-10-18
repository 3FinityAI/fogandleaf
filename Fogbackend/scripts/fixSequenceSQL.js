import sequelize from "../config/db.js";

async function fixSequence() {
  try {
    console.log("🔧 Starting sequence fix...");

    // First, let's see what's in the database
    const [products] = await sequelize.query(
      "SELECT id FROM products ORDER BY id"
    );
    console.log(
      "📊 Existing product IDs:",
      products.map((p) => p.id)
    );

    // Get the maximum ID
    const [maxResult] = await sequelize.query(
      "SELECT MAX(id) as max_id FROM products"
    );
    const maxId = maxResult[0]?.max_id || 0;
    console.log(`🔢 Current maximum ID: ${maxId}`);

    // Check current sequence value
    const [seqResult] = await sequelize.query(
      "SELECT last_value FROM products_id_seq"
    );
    console.log(`📈 Current sequence value: ${seqResult[0]?.last_value}`);

    // Reset sequence to start after the maximum ID
    const nextId = maxId + 1;
    await sequelize.query(`SELECT setval('products_id_seq', ${nextId}, false)`);

    console.log(`✅ Sequence reset to start from: ${nextId}`);

    // Verify the fix
    const [newSeqResult] = await sequelize.query(
      "SELECT last_value FROM products_id_seq"
    );
    console.log(`🔍 New sequence value: ${newSeqResult[0]?.last_value}`);

    console.log("🎉 Sequence fix completed successfully!");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing sequence:", error);
    await sequelize.close();
    process.exit(1);
  }
}

fixSequence();
