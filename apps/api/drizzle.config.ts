import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadMonorepoEnv } from "./src/lib/load-env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadMonorepoEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn(
    "[drizzle.config] DATABASE_URL is not set. Set it before running drizzle-kit generate or migrate.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: path.join(__dirname, "../../packages/shared/src/schema/tables.ts"),
  /** Relative to this config file — avoids drizzle-kit path bugs with absolute `out`. */
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl ?? "",
  },
});
