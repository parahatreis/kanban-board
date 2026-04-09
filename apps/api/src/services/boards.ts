import type { Database } from "../db/client.js";
import * as dbBoards from "../db/boards.js";
import * as dbColumns from "../db/columns.js";
import * as dbCards from "../db/cards.js";
import { HttpError } from "../lib/errors.js";

export async function assertBoardOwnedByUser(
  db: Database,
  boardId: string,
  userId: string,
) {
  const board = await dbBoards.getBoardById(db, boardId);
  if (!board || board.userId !== userId) {
    throw new HttpError(404, "Board not found", "BOARD_NOT_FOUND");
  }
  return board;
}

export async function listBoardsForUser(db: Database, userId: string) {
  return dbBoards.listBoardsByUser(db, userId);
}

export async function getBoardDetail(db: Database, boardId: string, userId: string) {
  await assertBoardOwnedByUser(db, boardId, userId);
  const [board, columns, cards] = await Promise.all([
    dbBoards.getBoardById(db, boardId),
    dbColumns.listColumnsByBoard(db, boardId),
    dbCards.listCardsByBoard(db, boardId),
  ]);
  return { board: board!, columns, cards };
}
