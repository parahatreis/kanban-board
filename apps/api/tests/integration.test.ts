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

  it("GET /api/boards/:boardId accepts search query", async () => {
    const list = await app.inject({ method: "GET", url: "/api/boards" });
    expect(list.statusCode).toBe(200);
    const { boards } = JSON.parse(list.body) as { boards: { id: string }[] };
    if (boards.length === 0) return;
    const boardId = boards[0].id;
    const res = await app.inject({
      method: "GET",
      url: `/api/boards/${boardId}?search=___unlikely___`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { cards: unknown[] };
    expect(Array.isArray(body.cards)).toBe(true);
  });

  it("creates card, adds comment, soft-deletes card", async () => {
    const boardsRes = await app.inject({ method: "GET", url: "/api/boards" });
    expect(boardsRes.statusCode).toBe(200);
    const { boards } = JSON.parse(boardsRes.body) as { boards: { id: string }[] };
    expect(boards.length).toBeGreaterThan(0);
    const boardId = boards[0].id;
    const detail = await app.inject({ method: "GET", url: `/api/boards/${boardId}` });
    expect(detail.statusCode).toBe(200);
    const parsed = JSON.parse(detail.body) as {
      columns: { id: string }[];
      cards: { columnId: string; position: number }[];
    };
    expect(parsed.columns.length).toBeGreaterThan(0);
    const columnId = parsed.columns[0].id;
    const inCol = parsed.cards.filter((c) => c.columnId === columnId);
    const nextPos =
      inCol.length === 0 ? 0 : Math.max(...inCol.map((c) => c.position)) + 1;

    const create = await app.inject({
      method: "POST",
      url: "/api/cards",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        boardId,
        columnId,
        title: "Integration test card",
        position: nextPos,
        description: "integration",
      }),
    });
    expect(create.statusCode).toBe(201);
    const created = JSON.parse(create.body) as { id: string };
    const cardId = created.id;

    const postComment = await app.inject({
      method: "POST",
      url: `/api/cards/${cardId}/comments`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ body: "integration comment" }),
    });
    expect(postComment.statusCode).toBe(201);

    const comments = await app.inject({ method: "GET", url: `/api/cards/${cardId}/comments` });
    expect(comments.statusCode).toBe(200);
    const body = JSON.parse(comments.body) as { comments: { body: string }[] };
    expect(body.comments.some((c) => c.body === "integration comment")).toBe(true);

    const del = await app.inject({ method: "DELETE", url: `/api/cards/${cardId}` });
    expect(del.statusCode).toBe(204);

    const after = await app.inject({ method: "GET", url: `/api/boards/${boardId}` });
    expect(after.statusCode).toBe(200);
    const { cards } = JSON.parse(after.body) as { cards: { id: string }[] };
    expect(cards.some((c) => c.id === cardId)).toBe(false);
  });
});
