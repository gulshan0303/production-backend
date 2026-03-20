import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database
});

async function connectWithRetry() {
  const maxRetries = 10;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.connect();
      console.log("✅ DB Connected Successfully");
      return;
    } catch (err) {
      console.log(`⏳ DB not ready, retrying... (${i + 1})`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }

  console.error("❌ DB Connection Failed after retries");
}

connectWithRetry();