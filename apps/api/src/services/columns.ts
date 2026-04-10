import type { Database } from "../db/client.js";
import * as dbColumns from "../db/columns.js";
import { HttpError } from "../lib/errors.js";
import * as boardsService from "./boards.js";

export async function createColumnForUser(
  db: Database,
  userId: string,
  boardId: string,
  input: { title: string },
) {
  await boardsService.assertBoardOwnedByUser(db, boardId, userId);
  const cols = await dbColumns.listColumnsByBoard(db, boardId);
  const position = cols.length;
  return dbColumns.insertColumn(db, {
    boardId,
    title: input.title,
    position,
  });
}

export async function updateColumnForUser(
  db: Database,
  userId: string,
  columnId: string,
  patch: { title: string },
) {
  const col = await dbColumns.getColumnById(db, columnId);
  if (!col) {
    throw new HttpError(404, "Column not found", "COLUMN_NOT_FOUND");
  }
  await boardsService.assertBoardOwnedByUser(db, col.boardId, userId);
  return dbColumns.updateColumn(db, columnId, { title: patch.title });
}

export async function reorderBoardColumnsForUser(
  db: Database,
  userId: string,
  boardId: string,
  orderedColumnIds: string[],
) {
  await boardsService.assertBoardOwnedByUser(db, boardId, userId);
  const existing = await dbColumns.listColumnsByBoard(db, boardId);
  if (existing.length !== orderedColumnIds.length) {
    throw new HttpError(400, "Column order must include every column on the board", "INVALID_COLUMN_ORDER");
  }
  const set = new Set(existing.map((c) => c.id));
  for (const id of orderedColumnIds) {
    if (!set.has(id)) {
      throw new HttpError(400, "Unknown column id in order", "INVALID_COLUMN_ORDER");
    }
  }
  await dbColumns.setColumnPositions(db, boardId, orderedColumnIds);
}

export async function deleteColumnForUser(db: Database, userId: string, columnId: string) {
  const col = await dbColumns.getColumnById(db, columnId);
  if (!col) {
    throw new HttpError(404, "Column not found", "COLUMN_NOT_FOUND");
  }
  await boardsService.assertBoardOwnedByUser(db, col.boardId, userId);
  await dbColumns.deleteColumn(db, columnId);
}
