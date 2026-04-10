import type { BoardRow, CardRow, ColumnRow, UserRow } from "shared";

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

export function normalizeUser(row: UserRow): UserRow {
  return {
    ...row,
    createdAt: parseDate(row.createdAt as unknown),
  };
}

export function normalizeCard(row: CardRow): CardRow {
  return {
    ...row,
    description: row.description ?? "",
    label: row.label ?? "",
    createdAt: parseDate(row.createdAt as unknown),
    assigneeUserId: row.assigneeUserId ?? null,
    deletedAt: row.deletedAt ? parseDate(row.deletedAt as unknown) : null,
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
