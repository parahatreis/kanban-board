import type { Database } from "../db/client.js";
import * as dbCards from "../db/cards.js";
import * as dbColumns from "../db/columns.js";
import * as dbUsers from "../db/users.js";
import type { CardListFilters } from "../db/cards.js";
import { HttpError } from "../lib/errors.js";
import * as boardsService from "./boards.js";

export async function assertCardOwnedByUser(
  db: Database,
  cardId: string,
  userId: string,
) {
  const card = await dbCards.getCardById(db, cardId);
  if (!card) {
    throw new HttpError(404, "Card not found", "CARD_NOT_FOUND");
  }
  await boardsService.assertBoardOwnedByUser(db, card.boardId, userId);
  return card;
}

export async function listCardsForBoard(
  db: Database,
  boardId: string,
  userId: string,
  filters: CardListFilters,
) {
  await boardsService.assertBoardOwnedByUser(db, boardId, userId);
  return dbCards.listCardsByBoard(db, boardId, filters);
}

export async function createCard(
  db: Database,
  userId: string,
  input: {
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
    position: number;
    label?: string;
    assigneeUserId?: string;
  },
) {
  await boardsService.assertBoardOwnedByUser(db, input.boardId, userId);
  const column = await dbColumns.getColumnById(db, input.columnId);
  if (!column || column.boardId !== input.boardId) {
    throw new HttpError(400, "Column does not belong to this board", "INVALID_COLUMN");
  }
  if (input.assigneeUserId !== undefined) {
    const assignee = await dbUsers.getUserById(db, input.assigneeUserId);
    if (!assignee) {
      throw new HttpError(400, "Assignee user not found", "ASSIGNEE_NOT_FOUND");
    }
  }
  return dbCards.insertCard(db, {
    boardId: input.boardId,
    columnId: input.columnId,
    title: input.title,
    description: input.description,
    position: input.position,
    label: input.label,
    assigneeUserId: input.assigneeUserId ?? null,
  });
}

export async function updateCard(
  db: Database,
  userId: string,
  cardId: string,
  patch: {
    title?: string;
    description?: string;
    label?: string;
    position?: number;
    columnId?: string;
    boardId?: string;
    assigneeUserId?: string | null;
  },
) {
  const card = await assertCardOwnedByUser(db, cardId, userId);
  if (patch.columnId !== undefined && patch.columnId !== card.columnId) {
    const col = await dbColumns.getColumnById(db, patch.columnId);
    if (!col || col.boardId !== card.boardId) {
      throw new HttpError(400, "Column does not belong to this board", "INVALID_COLUMN");
    }
  }
  if (patch.boardId !== undefined && patch.boardId !== card.boardId) {
    throw new HttpError(400, "Cannot move card to another board via PATCH", "INVALID_BOARD");
  }
  if (patch.assigneeUserId !== undefined && patch.assigneeUserId !== null) {
    const assignee = await dbUsers.getUserById(db, patch.assigneeUserId);
    if (!assignee) {
      throw new HttpError(400, "Assignee user not found", "ASSIGNEE_NOT_FOUND");
    }
  }
  return dbCards.updateCard(db, cardId, {
    title: patch.title,
    description: patch.description,
    label: patch.label,
    position: patch.position,
    columnId: patch.columnId,
    ...(patch.assigneeUserId !== undefined
      ? { assigneeUserId: patch.assigneeUserId }
      : {}),
  });
}

export async function deleteCardForUser(db: Database, userId: string, cardId: string) {
  await assertCardOwnedByUser(db, cardId, userId);
  return dbCards.softDeleteCard(db, cardId);
}

export async function moveCardForUser(
  db: Database,
  userId: string,
  cardId: string,
  target: { columnId: string; position: number },
) {
  const card = await assertCardOwnedByUser(db, cardId, userId);
  const column = await dbColumns.getColumnById(db, target.columnId);
  if (!column || column.boardId !== card.boardId) {
    throw new HttpError(400, "Column does not belong to this board", "INVALID_COLUMN");
  }
  return dbCards.moveCard(db, cardId, {
    columnId: target.columnId,
    boardId: card.boardId,
    position: target.position,
  });
}

export async function reorderColumnForUser(
  db: Database,
  userId: string,
  columnId: string,
  orderedCardIds: string[],
) {
  const column = await dbColumns.getColumnById(db, columnId);
  if (!column) {
    throw new HttpError(404, "Column not found", "COLUMN_NOT_FOUND");
  }
  await boardsService.assertBoardOwnedByUser(db, column.boardId, userId);
  await dbCards.setCardPositionsInColumn(db, columnId, orderedCardIds);
}
