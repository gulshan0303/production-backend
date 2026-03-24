import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.db.host,           // should be "postgres" (service name)
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  // optional but nice
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

async function waitForDb(maxRetries = 30, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      console.log("✅ PostgreSQL is ready!");
      client.release();
      return;
    } catch (err: any) {
      console.log(`⏳ DB not ready yet (${i + 1}/${maxRetries}): ${err.message}`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  throw new Error("❌ Could not connect to PostgreSQL after max retries");
}

// Call this at startup (before starting your server)
waitForDb()
  .then(() => {
    console.log("Starting server...");
    // app.listen(...) or whatever
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });