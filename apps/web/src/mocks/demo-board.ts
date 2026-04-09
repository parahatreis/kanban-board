import type { BoardRow, CardRow, ColumnRow } from "shared";

/** Stable ids for mock data (Phase 4 — no API). */
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_BOARD_ID = "10000000-0000-4000-8000-000000000001";

export const DEMO_COLUMN_A_ID = "20000000-0000-4000-8000-000000000001";
export const DEMO_COLUMN_B_ID = "20000000-0000-4000-8000-000000000002";
export const DEMO_COLUMN_C_ID = "20000000-0000-4000-8000-000000000003";
export const DEMO_COLUMN_D_ID = "20000000-0000-4000-8000-000000000004";

const created = new Date("2025-01-01T12:00:00.000Z");

export const demoBoard: BoardRow = {
  id: DEMO_BOARD_ID,
  userId: DEMO_USER_ID,
  name: "Workspace overview",
  createdAt: created,
};

export const demoColumns: ColumnRow[] = [
  {
    id: DEMO_COLUMN_A_ID,
    boardId: DEMO_BOARD_ID,
    title: "Discovery",
    position: 0,
  },
  {
    id: DEMO_COLUMN_B_ID,
    boardId: DEMO_BOARD_ID,
    title: "Build",
    position: 1,
  },
  {
    id: DEMO_COLUMN_C_ID,
    boardId: DEMO_BOARD_ID,
    title: "Design",
    position: 2,
  },
  {
    id: DEMO_COLUMN_D_ID,
    boardId: DEMO_BOARD_ID,
    title: "Launch",
    position: 3,
  },
];

/** Labels may use `Primary|Secondary` for two badge rows in the UI. */
export const demoCards: CardRow[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_A_ID,
    title: "User interviews synthesis",
    description: "Consolidate notes from last week’s sessions.",
    position: 0,
    label: "In progress|Research",
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_A_ID,
    title: "Competitive landscape map",
    description: "",
    position: 1,
    label: "To-do|Strategy",
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_A_ID,
    title: "Define success metrics",
    description: "North-star + guardrails for Q2.",
    position: 2,
    label: "Review|Product",
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_A_ID,
    title: "Stakeholder sync deck",
    description: "",
    position: 3,
    label: "Blocked|Ops",
  },
  {
    id: "30000000-0000-4000-8000-000000000005",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_A_ID,
    title: "Risk register draft",
    description: "Top five risks with mitigations.",
    position: 4,
    label: "To-do|Compliance",
  },
  {
    id: "30000000-0000-4000-8000-000000000006",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_B_ID,
    title: "API contract for tasks",
    description: "OpenAPI draft for move and reorder.",
    position: 0,
    label: "In progress|Backend",
  },
  {
    id: "30000000-0000-4000-8000-000000000007",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_B_ID,
    title: "Board column virtualization",
    description: "",
    position: 1,
    label: "To-do|Frontend",
  },
  {
    id: "30000000-0000-4000-8000-000000000008",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_B_ID,
    title: "E2E smoke for drag targets",
    description: "Cover column drop and reorder.",
    position: 2,
    label: "QA|Automation",
  },
  {
    id: "30000000-0000-4000-8000-000000000009",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_B_ID,
    title: "Feature flag rollout plan",
    description: "",
    position: 3,
    label: "Review|Platform",
  },
  {
    id: "30000000-0000-4000-8000-000000000010",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_C_ID,
    title: "Card density & spacing pass",
    description: "Match workspace reference tokens.",
    position: 0,
    label: "In progress|UX",
  },
  {
    id: "30000000-0000-4000-8000-000000000011",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_C_ID,
    title: "Empty states illustration",
    description: "",
    position: 1,
    label: "To-do|Brand",
  },
  {
    id: "30000000-0000-4000-8000-000000000012",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_C_ID,
    title: "Motion for drag overlay",
    description: "Subtle scale + shadow on pickup.",
    position: 2,
    label: "Review|Motion",
  },
  {
    id: "30000000-0000-4000-8000-000000000013",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_C_ID,
    title: "Sidebar IA review",
    description: "",
    position: 3,
    label: "To-do|UX",
  },
  {
    id: "30000000-0000-4000-8000-000000000014",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_D_ID,
    title: "Release checklist",
    description: "Changelog + comms template.",
    position: 0,
    label: "In progress|GTM",
  },
  {
    id: "30000000-0000-4000-8000-000000000015",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_D_ID,
    title: "Performance budget sign-off",
    description: "",
    position: 1,
    label: "Review|Perf",
  },
  {
    id: "30000000-0000-4000-8000-000000000016",
    boardId: DEMO_BOARD_ID,
    columnId: DEMO_COLUMN_D_ID,
    title: "Support macro updates",
    description: "New articles for board shortcuts.",
    position: 2,
    label: "To-do|Support",
  },
];
