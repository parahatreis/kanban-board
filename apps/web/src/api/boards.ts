import type { BoardRow, CardRow, ColumnRow } from "shared";
import { apiFetch } from "@/api/client";
import { normalizeBoard, normalizeBoardDetail } from "@/api/parse";

export async function listBoards(): Promise<BoardRow[]> {
  const res = await apiFetch<{ boards: BoardRow[] }>("/api/boards");
  return res.boards.map((b) => normalizeBoard(b));
}

export async function getBoardDetail(boardId: string): Promise<{
  board: BoardRow;
  columns: ColumnRow[];
  cards: CardRow[];
}> {
  const raw = await apiFetch<{
    board: BoardRow;
    columns: ColumnRow[];
    cards: CardRow[];
  }>(`/api/boards/${boardId}`);
  return normalizeBoardDetail(raw);
}
