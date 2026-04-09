import type { BoardRow, CardRow, ColumnRow } from "shared";
import {
  DEMO_BOARD_ID,
  DEMO_USER_ID,
  demoBoard,
  demoCards,
  demoColumns,
} from "@/mocks/demo-board";

/** Second mock board (lighter dataset). */
export const DEMO_BOARD_B_ID = "11000000-0000-4000-8000-000000000002";

const COL_B_1 = "21000000-0000-4000-8000-000000000001";
const COL_B_2 = "21000000-0000-4000-8000-000000000002";

const demoBoardB: BoardRow = {
  id: DEMO_BOARD_B_ID,
  userId: DEMO_USER_ID,
  name: "Product roadmap",
  createdAt: new Date("2025-02-01T12:00:00.000Z"),
};

const demoColumnsB: ColumnRow[] = [
  {
    id: COL_B_1,
    boardId: DEMO_BOARD_B_ID,
    title: "Backlog",
    position: 0,
  },
  {
    id: COL_B_2,
    boardId: DEMO_BOARD_B_ID,
    title: "Shipped",
    position: 1,
  },
];

const demoCardsB: CardRow[] = [
  {
    id: "31000000-0000-4000-8000-000000000001",
    boardId: DEMO_BOARD_B_ID,
    columnId: COL_B_1,
    title: "Sample task",
    description: "Try dragging this card to the other column.",
    position: 0,
    label: "To-do|Planning",
  },
];

export type BoardDataset = {
  board: BoardRow;
  columns: ColumnRow[];
  cards: CardRow[];
};

const BOARD_DATASETS: Record<string, BoardDataset> = {
  [DEMO_BOARD_ID]: {
    board: demoBoard,
    columns: demoColumns,
    cards: demoCards,
  },
  [DEMO_BOARD_B_ID]: {
    board: demoBoardB,
    columns: demoColumnsB,
    cards: demoCardsB,
  },
};

export function getBoardDataset(boardId: string): BoardDataset | null {
  return BOARD_DATASETS[boardId] ?? null;
}

export function isKnownBoardId(boardId: string): boolean {
  return boardId in BOARD_DATASETS;
}

/** Rows for the boards index table (frontend mock). */
export const MOCK_BOARDS_TABLE: { id: string; name: string; updatedAt: string }[] =
  [
    {
      id: DEMO_BOARD_ID,
      name: demoBoard.name,
      updatedAt: "2026-04-09",
    },
    {
      id: DEMO_BOARD_B_ID,
      name: demoBoardB.name,
      updatedAt: "2026-04-02",
    },
  ];
