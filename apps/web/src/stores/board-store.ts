import { create } from "zustand";
import type { CardCreateForm, CardEditForm, CardRow, ColumnRow } from "shared";
import {
  DEMO_BOARD_ID,
  demoBoard,
  demoCards,
  demoColumns,
} from "@/mocks/demo-board";

export type GroupByMode = "none" | "label";

export interface BoardStoreState {
  boardId: string;
  columns: ColumnRow[];
  cards: CardRow[];
  /** Empty string = show all labels */
  labelFilter: string;
  groupBy: GroupByMode;
  setLabelFilter: (value: string) => void;
  setGroupBy: (v: GroupByMode) => void;
  addCard: (input: CardCreateForm) => void;
  updateCard: (cardId: string, patch: CardEditForm & { columnId?: string }) => void;
  deleteCard: (cardId: string) => void;
}

function nextPositionInColumn(cards: CardRow[], columnId: string): number {
  const inCol = cards.filter((c) => c.columnId === columnId);
  if (inCol.length === 0) return 0;
  return Math.max(...inCol.map((c) => c.position)) + 1;
}

function renormalizePositions(
  cards: CardRow[],
  columnId: string,
): CardRow[] {
  const inCol = cards
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.position - b.position);
  const idToPos = new Map(
    inCol.map((c, i) => [c.id, i] as const),
  );
  return cards.map((c) =>
    c.columnId === columnId && idToPos.has(c.id)
      ? { ...c, position: idToPos.get(c.id)! }
      : c,
  );
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  boardId: DEMO_BOARD_ID,
  columns: [...demoColumns].sort((a, b) => a.position - b.position),
  cards: [...demoCards],
  labelFilter: "",
  groupBy: "none",

  setLabelFilter: (labelFilter) => set({ labelFilter }),

  setGroupBy: (groupBy) => set({ groupBy }),

  addCard: (input) => {
    const { cards } = get();
    const position = nextPositionInColumn(cards, input.columnId);
    const newCard: CardRow = {
      id: crypto.randomUUID(),
      boardId: input.boardId,
      columnId: input.columnId,
      title: input.title,
      description: input.description ?? "",
      position,
      label: input.label ?? "",
    };
    set((s) => ({ cards: [...s.cards, newCard] }));
  },

  updateCard: (cardId, patch) => {
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              title: patch.title ?? c.title,
              description:
                patch.description !== undefined ? patch.description : c.description,
              label: patch.label !== undefined ? patch.label : c.label,
            }
          : c,
      ),
    }));
  },

  deleteCard: (cardId) => {
    set((s) => {
      const removed = s.cards.find((c) => c.id === cardId);
      if (!removed) return s;
      const cards = s.cards.filter((c) => c.id !== cardId);
      return {
        cards: renormalizePositions(cards, removed.columnId),
      };
    });
  },
}));

export function getDemoBoardMeta() {
  return { board: demoBoard, boardId: DEMO_BOARD_ID };
}
