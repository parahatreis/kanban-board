import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadMonorepoEnv } from "../src/lib/load-env.js";
import { buildApp } from "../src/app.js";

loadMonorepoEnv();
import { createDb, createPool } from "../src/db/client.js";
import { resolveDefaultUser } from "../src/lib/user-context.js";

const dbUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

describe.skipIf(!dbUrl)("API integration (Postgres)", () => {
  let pool: ReturnType<typeof createPool>;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    pool = createPool(dbUrl!);
    const db = createDb(pool);
    const defaultUser = await resolveDefaultUser(db);
    app = await buildApp({ db, defaultUser });
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("GET /api/health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { status: string };
    expect(body.status).toBe("ok");
  });

  it("GET /api/boards returns a list", async () => {
    const res = await app.inject({ method: "GET", url: "/api/boards" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { boards: unknown[] };
    expect(Array.isArray(body.boards)).toBe(true);
  });
});
