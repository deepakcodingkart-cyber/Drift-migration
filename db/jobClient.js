import pkg from "pg";
const { Pool } = pkg;

let pool;

export function getJobPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : false,
      max: 10,              // max connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on("error", (err) => {
      console.error("❌ PostgreSQL pool error", err);
    });

    console.log("✅ PostgreSQL Pool initialized");
  }

  return pool;
}
