import type { BoardRow, CardRow, ColumnRow } from "shared";

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return new Date();
}

export function normalizeBoard(row: BoardRow): BoardRow {
  return {
    ...row,
    createdAt: parseDate(row.createdAt as unknown),
  };
}

export function normalizeColumn(row: ColumnRow): ColumnRow {
  return { ...row };
}

export function normalizeCard(row: CardRow): CardRow {
  return {
    ...row,
    description: row.description ?? "",
    label: row.label ?? "",
  };
}

export function normalizeBoardDetail(payload: {
  board: BoardRow;
  columns: ColumnRow[];
  cards: CardRow[];
}): {
  board: BoardRow;
  columns: ColumnRow[];
  cards: CardRow[];
} {
  return {
    board: normalizeBoard(payload.board),
    columns: payload.columns.map(normalizeColumn),
    cards: payload.cards.map(normalizeCard),
  };
}
