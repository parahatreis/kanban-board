import { create } from "zustand";
import type {
  BoardRow,
  CardCreateForm,
  CardEditForm,
  CardRow,
  ColumnRow,
  UserRow,
} from "shared";
import { getBoardDetail } from "@/api/boards";
import { listUsers } from "@/api/users";
import { ApiError } from "@/api/client";
import * as cardsApi from "@/api/cards";
import * as columnsApi from "@/api/columns";

export type BoardLoadStatus = "idle" | "loading" | "ready" | "not_found" | "error";

export interface BoardStoreState {
  board: BoardRow | null;
  boardId: string;
  columns: ColumnRow[];
  cards: CardRow[];
  /** Users for assignee picker (same list as API). */
  users: UserRow[];
  /** Empty string = show all labels */
  labelFilter: string;
  loadStatus: BoardLoadStatus;
  loadError: string | null;

  setLabelFilter: (value: string) => void;
  loadBoard: (boardId: string, options?: { silent?: boolean }) => Promise<void>;
  addCard: (input: CardCreateForm) => Promise<void>;
  updateCard: (cardId: string, patch: CardEditForm & { columnId?: string }) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (
    cardId: string,
    target: { columnId: string; position: number },
  ) => Promise<void>;
  reorderInColumn: (columnId: string, orderedCardIds: string[]) => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  updateColumn: (columnId: string, title: string) => Promise<void>;
  reorderColumns: (orderedColumnIds: string[]) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
}

function nextPositionInColumn(cards: CardRow[], columnId: string): number {
  const inCol = cards.filter((c) => c.columnId === columnId);
  if (inCol.length === 0) return 0;
  return Math.max(...inCol.map((c) => c.position)) + 1;
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  board: null,
  boardId: "",
  columns: [],
  cards: [],
  users: [],
  labelFilter: "",
  loadStatus: "idle",
  loadError: null,

  setLabelFilter: (labelFilter) => set({ labelFilter }),

  loadBoard: async (boardId, options) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      set({
        boardId,
        loadStatus: "loading",
        loadError: null,
        board: null,
        columns: [],
        cards: [],
        users: [],
        labelFilter: "",
      });
    }
    try {
      const [data, usersRows] = await Promise.all([
        getBoardDetail(boardId),
        listUsers(),
      ]);
      set({
        board: data.board,
        boardId: data.board.id,
        columns: [...data.columns].sort((a, b) => a.position - b.position),
        cards: data.cards,
        users: usersRows,
        loadStatus: "ready",
        loadError: null,
      });
    } catch (e) {
      if (!silent) {
        if (e instanceof ApiError && e.status === 404) {
          set({
            loadStatus: "not_found",
            loadError: null,
            board: null,
            columns: [],
            cards: [],
            users: [],
          });
        } else {
          const msg = e instanceof Error ? e.message : "Failed to load board";
          set({
            loadStatus: "error",
            loadError: msg,
            board: null,
            columns: [],
            cards: [],
            users: [],
          });
        }
      }
      throw e;
    }
  },

  addCard: async (input) => {
    const boardId = get().boardId;
    const cards = get().cards;
    const position = nextPositionInColumn(cards, input.columnId);
    await cardsApi.createCard({
      boardId: input.boardId,
      columnId: input.columnId,
      title: input.title,
      description: input.description,
      position,
      label: input.label,
      assigneeUserId: input.assigneeUserId,
    });
    await get().loadBoard(boardId, { silent: true });
  },

  updateCard: async (cardId, patch) => {
    const boardId = get().boardId;
    await cardsApi.patchCard(cardId, {
      title: patch.title,
      description: patch.description,
      label: patch.label,
      assigneeUserId: patch.assigneeUserId,
    });
    await get().loadBoard(boardId, { silent: true });
  },

  deleteCard: async (cardId) => {
    const boardId = get().boardId;
    await cardsApi.deleteCard(cardId);
    await get().loadBoard(boardId, { silent: true });
  },

  moveCard: async (cardId, target) => {
    const boardId = get().boardId;
    await cardsApi.moveCard(cardId, target);
    await get().loadBoard(boardId, { silent: true });
  },

  reorderInColumn: async (columnId, orderedCardIds) => {
    const boardId = get().boardId;
    await cardsApi.reorderColumn(columnId, orderedCardIds);
    await get().loadBoard(boardId, { silent: true });
  },

  addColumn: async (title) => {
    const boardId = get().boardId;
    await columnsApi.createBoardColumn(boardId, { title });
    await get().loadBoard(boardId, { silent: true });
  },

  updateColumn: async (columnId, title) => {
    const boardId = get().boardId;
    await columnsApi.patchColumn(columnId, { title });
    await get().loadBoard(boardId, { silent: true });
  },

  reorderColumns: async (orderedColumnIds) => {
    const boardId = get().boardId;
    await columnsApi.reorderBoardColumns(boardId, orderedColumnIds);
    await get().loadBoard(boardId, { silent: true });
  },

  deleteColumn: async (columnId) => {
    const boardId = get().boardId;
    await columnsApi.deleteColumn(columnId);
    await get().loadBoard(boardId, { silent: true });
  },
}));

/** Drag-and-drop is only enabled when no label filter is active. */
export function getCanDrag(state: { labelFilter: string }): boolean {
  return state.labelFilter === "";
}
