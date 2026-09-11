import { readFileSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * ডাটাবেস URL নির্বাচনের অগ্রাধিকার:
 * 1. APP_DATABASE_URL (env) — যেকোনো হোস্টিংয়ে সরাসরি দেওয়া যায়
 * 2. .db-config.json (gitignored লোকাল ফাইল) — প্রিভিউ প্ল্যাটফর্ম .env overwrite
 *    করলেও এটি অক্ষত থাকে
 * 3. DATABASE_URL (env) — Vercel/স্ট্যান্ডার্ড হোস্টিংয়ে এটিই ব্যবহার করুন
 */
function resolveDatabaseUrl(): string {
  if (process.env.APP_DATABASE_URL) return process.env.APP_DATABASE_URL;
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("127.0.0.1")) {
    return process.env.DATABASE_URL;
  }
  try {
    const configPath = path.join(process.cwd(), ".db-config.json");
    const parsed = JSON.parse(readFileSync(configPath, "utf8")) as { url?: string };
    if (parsed.url) return parsed.url;
  } catch {
    // ফাইল না থাকলে নিচের fallback-এ যাবে
  }
  const fallback = process.env.DATABASE_URL;
  if (!fallback) throw new Error("DATABASE_URL is required");
  return fallback;
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({ connectionString: resolveDatabaseUrl() });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
