import type { BoardRow, CardRow, ColumnRow } from "shared";

/** Stable ids for mock data (Phase 4 — no API). */
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_BOARD_ID = "10000000-0000-4000-8000-000000000001";
export const DEMO_COLUMN_TODO_ID = "20000000-0000-4000-8000-000000000001";
export const DEMO_COLUMN_DONE_ID = "20000000-0000-4000-8000-000000000002";

const created = new Date("2025-01-01T12:00:00.000Z");

export const demoBoard: BoardRow = {
  id: DEMO_BOARD_ID,
  userId: DEMO_USER_ID,
  name: "Demo board",
  createdAt: created,
};

export const demoColumns: ColumnRow[] = [
  {
    id: DEMO_COLUMN_TODO_ID,
    boardId: DEMO_BOARD_ID,
    title: "Todo",
    position: 0,
  },
  {
    id: DEMO_COLUMN_DONE_ID,
    boardId: DEMO_BOARD_ID,
    title: "Done",
    position: 1,
  },
];

export const demoCards: CardRow[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_TODO_ID,
    title: "Welcome to the board",
    description: "Drag cards between columns when the UI is wired up.",
    position: 0,
    label: "feature",
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_TODO_ID,
    title: "Fix login redirect",
    description: "",
    position: 1,
    label: "bug",
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_DONE_ID,
    title: "Project setup",
    description: "Monorepo and DB are ready.",
    position: 0,
    label: "feature",
  },
];
