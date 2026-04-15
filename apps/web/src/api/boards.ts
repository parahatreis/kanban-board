import type { BoardRow, CardRow, ColumnRow } from "shared";
import { apiFetch } from "@/api/client";
import { normalizeBoard, normalizeBoardDetail } from "@/api/parse";

export async function createBoard(name: string): Promise<BoardRow> {
  const raw = await apiFetch<BoardRow>("/api/boards", {
    method: "POST",
    data: { name },
  });
  return normalizeBoard(raw);
}

export async function listBoards(): Promise<BoardRow[]> {
  const res = await apiFetch<{ boards: BoardRow[] }>("/api/boards");
  return res.boards.map((b) => normalizeBoard(b));
}

export async function getBoardDetail(
  boardId: string,
  query?: { search?: string; label?: string },
): Promise<{
  board: BoardRow;
  columns: ColumnRow[];
  cards: CardRow[];
}> {
  const params = new URLSearchParams();
  if (query?.search?.trim()) params.set("search", query.search.trim());
  if (query?.label?.trim()) params.set("label", query.label.trim());
  const qs = params.toString();
  const raw = await apiFetch<{
    board: BoardRow;
    columns: ColumnRow[];
    cards: CardRow[];
  }>(`/api/boards/${boardId}${qs ? `?${qs}` : ""}`);
  return normalizeBoardDetail(raw);
}
