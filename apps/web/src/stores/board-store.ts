import { create } from "zustand";
import type { BoardRow, CardCreateForm, CardEditForm, CardRow, ColumnRow } from "shared";
import { applyMove, applyReorderInColumn } from "@/lib/board-dnd";
import {
  DEMO_BOARD_ID,
  demoBoard,
  demoCards,
  demoColumns,
} from "@/mocks/demo-board";
import { getBoardDataset } from "@/mocks/board-datasets";

export interface BoardStoreState {
  board: BoardRow;
  boardId: string;
  columns: ColumnRow[];
  cards: CardRow[];
  /** Empty string = show all labels */
  labelFilter: string;
  setLabelFilter: (value: string) => void;
  addCard: (input: CardCreateForm) => void;
  updateCard: (cardId: string, patch: CardEditForm & { columnId?: string }) => void;
  deleteCard: (cardId: string) => void;
  /** Aligns with PATCH /api/cards/:id/move — positions renormalized in affected columns. */
  moveCard: (
    cardId: string,
    target: { columnId: string; position: number },
  ) => void;
  /** Aligns with PATCH /api/columns/:id/reorder — `orderedCardIds` is full column order. */
  reorderInColumn: (columnId: string, orderedCardIds: string[]) => void;
  /** Replace columns/cards from mock data for the given board (client-side only). */
  loadBoard: (boardId: string) => boolean;
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
  board: demoBoard,
  boardId: DEMO_BOARD_ID,
  columns: [...demoColumns].sort((a, b) => a.position - b.position),
  cards: [...demoCards],
  labelFilter: "",

  loadBoard: (boardId) => {
    const data = getBoardDataset(boardId);
    if (!data) return false;
    set({
      board: data.board,
      boardId: data.board.id,
      columns: [...data.columns].sort((a, b) => a.position - b.position),
      cards: [...data.cards],
      labelFilter: "",
    });
    return true;
  },

  setLabelFilter: (labelFilter) => set({ labelFilter }),

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

  moveCard: (cardId, target) => {
    set((s) => ({
      cards: applyMove(s.cards, cardId, target.columnId, target.position),
    }));
  },

  reorderInColumn: (columnId, orderedCardIds) => {
    set((s) => ({
      cards: applyReorderInColumn(s.cards, columnId, orderedCardIds),
    }));
  },
}));

/** Drag-and-drop is only enabled when no label filter is active. */
export function getCanDrag(state: { labelFilter: string }): boolean {
  return state.labelFilter === "";
}

