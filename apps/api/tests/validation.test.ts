import { describe, expect, it } from "vitest";
import type { UserRow } from "shared";
import { buildApp } from "../src/app.js";
import type { Database } from "../src/db/client.js";

const mockUser: UserRow = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@kanban.local",
  displayName: "Demo",
  createdAt: new Date(),
};

const mockDb = {} as Database;

describe("API validation (no database)", () => {
  it("rejects invalid board UUID on GET /api/boards/:boardId", async () => {
    const app = await buildApp({ db: mockDb, defaultUser: mockUser });
    const res = await app.inject({
      method: "GET",
      url: "/api/boards/not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body) as { error: { message: string } };
    expect(body.error.message).toBe("Invalid request");
    await app.close();
  });

  it("rejects empty body on POST /api/cards", async () => {
    const app = await buildApp({ db: mockDb, defaultUser: mockUser });
    const res = await app.inject({
      method: "POST",
      url: "/api/cards",
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it("rejects invalid column UUID on PATCH /api/columns/:columnId/reorder", async () => {
    const app = await buildApp({ db: mockDb, defaultUser: mockUser });
    const res = await app.inject({
      method: "PATCH",
      url: "/api/columns/bad-id/reorder",
      payload: { orderedCardIds: ["00000000-0000-4000-8000-000000000002"] },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});
