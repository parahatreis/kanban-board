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
import { normalizeCard, normalizeColumn } from "@/api/parse";
import { ApiError } from "@/api/client";
import * as cardsApi from "@/api/cards";
import * as columnsApi from "@/api/columns";

export type BoardLoadStatus = "idle" | "loading" | "ready" | "not_found" | "error";

export type GroupByMode = "none" | "label";

export interface BoardStoreState {
  board: BoardRow | null;
  boardId: string;
  columns: ColumnRow[];
  cards: CardRow[];
  /** Users for assignee picker (same list as API). */
  users: UserRow[];
  /** Empty string = show all labels */
  labelFilter: string;
  /** When `label`, each column shows cards in sections by label (layout reorganizes). */
  groupBy: GroupByMode;
  /** Server-side filter on GET /boards/:id (title/description search). */
  boardSearchQuery: string;
  loadStatus: BoardLoadStatus;
  loadError: string | null;

  setLabelFilter: (value: string) => void;
  setGroupBy: (mode: GroupByMode) => void;
  setBoardSearchQuery: (value: string) => void;
  loadBoard: (boardId: string, options?: { silent?: boolean; search?: string }) => Promise<void>;
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

/** Monotonic id so concurrent `loadBoard` completions cannot apply stale results. */
let loadBoardRequestSeq = 0;

function nextLoadRequestId(): number {
  loadBoardRequestSeq += 1;
  return loadBoardRequestSeq;
}

function isStaleLoadRequest(requestId: number): boolean {
  return requestId !== loadBoardRequestSeq;
}

function sortCardsStable(cards: CardRow[]): CardRow[] {
  return [...cards].sort((a, b) => {
    if (a.columnId !== b.columnId) return a.columnId.localeCompare(b.columnId);
    if (a.position !== b.position) return a.position - b.position;
    return a.id.localeCompare(b.id);
  });
}

function upsertCard(cards: CardRow[], card: CardRow): CardRow[] {
  const next = cards.filter((c) => c.id !== card.id);
  next.push(card);
  return sortCardsStable(next);
}

function removeCard(cards: CardRow[], cardId: string): CardRow[] {
  return cards.filter((c) => c.id !== cardId);
}

function applyColumnCardPositions(
  cards: CardRow[],
  columnId: string,
  orderedCardIds: string[],
): CardRow[] {
  const posById = new Map(orderedCardIds.map((id, i) => [id, i]));
  return sortCardsStable(
    cards.map((c) => {
      if (c.columnId !== columnId) return c;
      const pos = posById.get(c.id);
      if (pos === undefined) return c;
      return { ...c, position: pos };
    }),
  );
}

function applyColumnReorder(
  columns: ColumnRow[],
  orderedColumnIds: string[],
): ColumnRow[] {
  const byId = new Map(columns.map((c) => [c.id, c]));
  return orderedColumnIds
    .map((id, i) => {
      const col = byId.get(id);
      return col ? { ...col, position: i } : null;
    })
    .filter((c): c is ColumnRow => c !== null);
}

function removeColumnAndCards(
  columns: ColumnRow[],
  cards: CardRow[],
  columnId: string,
): { columns: ColumnRow[]; cards: CardRow[] } {
  return {
    columns: columns.filter((c) => c.id !== columnId),
    cards: cards.filter((c) => c.columnId !== columnId),
  };
}

function nextPositionInColumn(cards: CardRow[], columnId: string): number {
  const inCol = cards.filter((c) => c.columnId === columnId);
  if (inCol.length === 0) return 0;
  return Math.max(...inCol.map((c) => c.position)) + 1;
}

/** When server search is active, merged local state cannot match filtered GET; refetch instead. */
function needsFullBoardRefetch(state: BoardStoreState): boolean {
  return state.boardSearchQuery.trim().length > 0;
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  board: null,
  boardId: "",
  columns: [],
  cards: [],
  users: [],
  labelFilter: "",
  groupBy: "none",
  boardSearchQuery: "",
  loadStatus: "idle",
  loadError: null,

  setLabelFilter: (labelFilter) => set({ labelFilter }),

  setGroupBy: (groupBy) => set({ groupBy }),

  setBoardSearchQuery: (boardSearchQuery) => {
    if (get().boardSearchQuery === boardSearchQuery) return;
    set({ boardSearchQuery });
    const boardId = get().boardId;
    if (boardId && get().loadStatus === "ready") {
      void get().loadBoard(boardId, { silent: true });
    }
  },

  loadBoard: async (boardId, options) => {
    const silent = options?.silent ?? false;
    const requestId = nextLoadRequestId();

    if (options?.search !== undefined) {
      set({ boardSearchQuery: options.search });
    }
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
        groupBy: "none",
        boardSearchQuery: options?.search ?? "",
      });
    }
    try {
      const q = get().boardSearchQuery.trim();
      const usersPromise = silent ? Promise.resolve(get().users) : listUsers();
      const [data, usersRows] = await Promise.all([
        getBoardDetail(boardId, { search: q || undefined }),
        usersPromise,
      ]);
      if (isStaleLoadRequest(requestId)) return;
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
      if (isStaleLoadRequest(requestId)) return;
      if (!silent) {
        if (e instanceof ApiError && e.status === 404) {
          set({
            loadStatus: "not_found",
            loadError: null,
            board: null,
            columns: [],
            cards: [],
            users: [],
            labelFilter: "",
            groupBy: "none",
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
            labelFilter: "",
            groupBy: "none",
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
    const row = await cardsApi.createCard({
      boardId: input.boardId,
      columnId: input.columnId,
      title: input.title,
      description: input.description,
      position,
      label: input.label,
      assigneeUserId: input.assigneeUserId,
    });
    const normalized = normalizeCard(row);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    set({ cards: upsertCard(state.cards, normalized) });
  },

  updateCard: async (cardId, patch) => {
    const boardId = get().boardId;
    const row = await cardsApi.patchCard(cardId, {
      title: patch.title,
      description: patch.description,
      label: patch.label,
      assigneeUserId: patch.assigneeUserId,
    });
    const normalized = normalizeCard(row);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    set({ cards: upsertCard(state.cards, normalized) });
  },

  deleteCard: async (cardId) => {
    const boardId = get().boardId;
    await cardsApi.deleteCard(cardId);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    set({ cards: removeCard(state.cards, cardId) });
  },

  moveCard: async (cardId, target) => {
    const boardId = get().boardId;
    await cardsApi.moveCard(cardId, target);
    /** Single-row PATCH can leave sibling positions inconsistent; keep server truth. */
    await get().loadBoard(boardId, { silent: true });
  },

  reorderInColumn: async (columnId, orderedCardIds) => {
    const boardId = get().boardId;
    await cardsApi.reorderColumn(columnId, orderedCardIds);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    set({
      cards: applyColumnCardPositions(state.cards, columnId, orderedCardIds),
    });
  },

  addColumn: async (title) => {
    const boardId = get().boardId;
    const col = await columnsApi.createBoardColumn(boardId, { title });
    const normalized = normalizeColumn(col);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    set({
      columns: [...state.columns, normalized].sort((a, b) => a.position - b.position),
    });
  },

  updateColumn: async (columnId, title) => {
    const boardId = get().boardId;
    const col = await columnsApi.patchColumn(columnId, { title });
    const normalized = normalizeColumn(col);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    set({
      columns: state.columns.map((c) => (c.id === columnId ? normalized : c)),
    });
  },

  reorderColumns: async (orderedColumnIds) => {
    const boardId = get().boardId;
    await columnsApi.reorderBoardColumns(boardId, orderedColumnIds);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    set({ columns: applyColumnReorder(state.columns, orderedColumnIds) });
  },

  deleteColumn: async (columnId) => {
    const boardId = get().boardId;
    await columnsApi.deleteColumn(columnId);
    const state = get();
    if (needsFullBoardRefetch(state)) {
      await get().loadBoard(boardId, { silent: true });
      return;
    }
    const { columns, cards } = removeColumnAndCards(
      state.columns,
      state.cards,
      columnId,
    );
    set({ columns, cards });
  },
}));

/** DnD off when filtering or grouping by label (avoids partial lists / multi-section DnD). */
export function getCanDrag(state: { labelFilter: string; groupBy: GroupByMode }): boolean {
  return state.labelFilter === "" && state.groupBy === "none";
}
