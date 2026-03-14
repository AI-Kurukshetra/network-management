import { readFile } from "node:fs/promises";
import process from "node:process";
import { Client } from "pg";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node scripts/run-sql.mjs <sql-file>");
    process.exit(1);
  }

  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("SUPABASE_DB_URL is required to run SQL scripts.");
    process.exit(1);
  }

  const sql = await readFile(filePath, "utf8");
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log(`Executed ${filePath}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
