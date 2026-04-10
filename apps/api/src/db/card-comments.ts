import { asc, eq } from "drizzle-orm";
import { cardComments } from "shared";
import type { Database } from "./client.js";

export async function listCommentsByCardId(db: Database, cardId: string) {
  return db.query.cardComments.findMany({
    where: eq(cardComments.cardId, cardId),
    orderBy: [asc(cardComments.createdAt)],
    with: {
      author: true,
    },
  });
}

export async function insertCardComment(
  db: Database,
  values: { cardId: string; userId: string; body: string },
) {
  const [row] = await db.insert(cardComments).values(values).returning();
  return row;
}
