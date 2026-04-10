import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { cards } from "shared";
import type { Database } from "./client.js";

export async function insertCard(
  db: Database,
  values: {
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
    position: number;
    label?: string;
    assigneeUserId?: string | null;
  },
) {
  const [row] = await db
    .insert(cards)
    .values({
      description: "",
      label: "",
      ...values,
    })
    .returning();
  return row;
}

export async function getCardById(db: Database, id: string) {
  return db.query.cards.findFirst({
    where: eq(cards.id, id),
  });
}

export type CardListFilters = {
  /** Exact match on label (filter-by-attribute). */
  label?: string;
  /** Case-insensitive substring on title or description. */
  search?: string;
};

export async function listCardsByBoard(
  db: Database,
  boardId: string,
  filters: CardListFilters = {},
) {
  const parts: SQL[] = [eq(cards.boardId, boardId)];

  if (filters.label !== undefined && filters.label !== "") {
    parts.push(eq(cards.label, filters.label));
  }

  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    parts.push(or(ilike(cards.title, q), ilike(cards.description, q))!);
  }

  const where = parts.length === 1 ? parts[0] : and(...parts);

  return db.query.cards.findMany({
    where,
    orderBy: [asc(cards.columnId), asc(cards.position)],
  });
}

export async function listCardsByColumn(db: Database, columnId: string) {
  return db.query.cards.findMany({
    where: eq(cards.columnId, columnId),
    orderBy: [asc(cards.position)],
  });
}

export async function updateCard(
  db: Database,
  id: string,
  values: {
    title?: string;
    description?: string;
    label?: string;
    position?: number;
    columnId?: string;
    boardId?: string;
    assigneeUserId?: string | null;
  },
) {
  const [row] = await db
    .update(cards)
    .set(values)
    .where(eq(cards.id, id))
    .returning();
  return row;
}

/** Move card to another column and set its position (caller may normalize sibling positions). */
export async function moveCard(
  db: Database,
  cardId: string,
  target: { columnId: string; boardId: string; position: number },
) {
  return updateCard(db, cardId, {
    columnId: target.columnId,
    boardId: target.boardId,
    position: target.position,
  });
}

/**
 * Set positions within a column for the given ordered card ids (0..n-1).
 */
export async function setCardPositionsInColumn(
  db: Database,
  columnId: string,
  orderedCardIds: string[],
) {
  for (let i = 0; i < orderedCardIds.length; i++) {
    await db
      .update(cards)
      .set({ position: i })
      .where(and(eq(cards.columnId, columnId), eq(cards.id, orderedCardIds[i])));
  }
}

export async function deleteCard(db: Database, id: string) {
  const [row] = await db.delete(cards).where(eq(cards.id, id)).returning();
  return row;
}
