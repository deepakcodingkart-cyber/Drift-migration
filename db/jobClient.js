import pkg from "pg";

const { Client } = pkg;

let client;

export async function getJobClient() {
  if (!client) {
    client = new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : false
    });

    client.on("error", (err) => {
      console.error("❌ PostgreSQL client error", err);
      client = null; // reset so next call reconnects
    });


    await client.connect();
    console.log("✅ Connected to PostgreSQL");
  }

  return client;
}
