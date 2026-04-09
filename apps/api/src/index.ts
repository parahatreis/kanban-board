import { createDb, createPool } from "./db/client.js";
import { buildApp } from "./app.js";
import { loadMonorepoEnv } from "./lib/load-env.js";
import { resolveDefaultUser } from "./lib/user-context.js";

loadMonorepoEnv();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  const pool = createPool(url);
  const db = createDb(pool);
  const defaultUser = await resolveDefaultUser(db);
  const app = await buildApp({ db, defaultUser });

  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
