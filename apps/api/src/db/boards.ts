import { desc, eq } from "drizzle-orm";
import { boards } from "shared";
import type { Database } from "./client.js";

export async function insertBoard(
  db: Database,
  values: { userId: string; name: string },
) {
  const [row] = await db.insert(boards).values(values).returning();
  return row;
}

export async function getBoardById(db: Database, id: string) {
  return db.query.boards.findFirst({
    where: eq(boards.id, id),
  });
}

export async function listBoards(db: Database) {
  return db.query.boards.findMany({
    orderBy: [desc(boards.createdAt)],
  });
}

export async function listBoardsByUser(db: Database, userId: string) {
  return db.query.boards.findMany({
    where: eq(boards.userId, userId),
    orderBy: [desc(boards.createdAt)],
  });
}

export async function updateBoard(
  db: Database,
  id: string,
  values: { name?: string },
) {
  const [row] = await db
    .update(boards)
    .set(values)
    .where(eq(boards.id, id))
    .returning();
  return row;
}

export async function deleteBoard(db: Database, id: string) {
  const [row] = await db.delete(boards).where(eq(boards.id, id)).returning();
  return row;
}
