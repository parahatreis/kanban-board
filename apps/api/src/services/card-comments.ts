import type { Database } from "../db/client.js";
import * as dbComments from "../db/card-comments.js";
import * as cardsService from "./cards.js";

export async function listCommentsForCardForUser(
  db: Database,
  userId: string,
  cardId: string,
) {
  await cardsService.assertCardOwnedByUser(db, cardId, userId);
  return dbComments.listCommentsByCardId(db, cardId);
}

export async function addCommentForCardForUser(
  db: Database,
  userId: string,
  cardId: string,
  body: string,
) {
  await cardsService.assertCardOwnedByUser(db, cardId, userId);
  return dbComments.insertCardComment(db, {
    cardId,
    userId,
    body,
  });
}
