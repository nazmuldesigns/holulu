import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

function resolveDatabaseUrl(): string {
  if (process.env.APP_DATABASE_URL) return process.env.APP_DATABASE_URL;
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("127.0.0.1")) {
    return process.env.DATABASE_URL;
  }
  try {
    const parsed = JSON.parse(
      readFileSync(path.join(process.cwd(), ".db-config.json"), "utf8")
    ) as { url?: string };
    if (parsed.url) return parsed.url;
  } catch {
    // ignore
  }
  return (
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db"
  );
}

// Some drivers (libpq/CLI) need channel_binding stripped; node-postgres handles it,
// but drizzle-kit is happier with a sanitized URL.
const sanitizedUrl = resolveDatabaseUrl().replace(/[?&]channel_binding=[^&]*/i, "");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: sanitizedUrl,
  },
});
