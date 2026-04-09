import { and, asc, eq } from "drizzle-orm";
import { columns } from "shared";
import type { Database } from "./client.js";

export async function insertColumn(
  db: Database,
  values: {
    boardId: string;
    title: string;
    position: number;
  },
) {
  const [row] = await db.insert(columns).values(values).returning();
  return row;
}

export async function listColumnsByBoard(db: Database, boardId: string) {
  return db.query.columns.findMany({
    where: eq(columns.boardId, boardId),
    orderBy: [asc(columns.position)],
  });
}

export async function getColumnById(db: Database, id: string) {
  return db.query.columns.findFirst({
    where: eq(columns.id, id),
  });
}

export async function updateColumn(
  db: Database,
  id: string,
  values: { title?: string; position?: number },
) {
  const [row] = await db
    .update(columns)
    .set(values)
    .where(eq(columns.id, id))
    .returning();
  return row;
}

/** Reassign contiguous positions 0..n-1 for columns on a board (after reorder). */
export async function setColumnPositions(
  db: Database,
  boardId: string,
  orderedColumnIds: string[],
) {
  for (let i = 0; i < orderedColumnIds.length; i++) {
    await db
      .update(columns)
      .set({ position: i })
      .where(
        and(eq(columns.boardId, boardId), eq(columns.id, orderedColumnIds[i])),
      );
  }
}

export async function deleteColumn(db: Database, id: string) {
  const [row] = await db.delete(columns).where(eq(columns.id, id)).returning();
  return row;
}
