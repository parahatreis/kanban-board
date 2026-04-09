import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.join(__dirname, "../../.env") });
config({ path: path.join(__dirname, ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn(
    "[drizzle.config] DATABASE_URL is not set. Set it before running drizzle-kit generate or migrate.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: path.join(__dirname, "../../packages/shared/src/schema/tables.ts"),
  out: path.join(__dirname, "drizzle"),
  dbCredentials: {
    url: databaseUrl ?? "",
  },
});
