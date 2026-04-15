import type { BoardRow } from "shared";
import { create } from "zustand";
import { createBoard as apiCreateBoard, listBoards } from "@/api/boards";
import { ApiError } from "@/api/client";

type Status = "idle" | "loading" | "ready";

interface BoardsDirectoryState {
  boards: BoardRow[] | null;
  error: string | null;
  status: Status;
  loadBoardsDirectory: () => Promise<void>;
  createBoard: (name: string) => Promise<BoardRow>;
}

export const useBoardsDirectoryStore = create<BoardsDirectoryState>((set, get) => ({
  boards: null,
  error: null,
  status: "idle",
  loadBoardsDirectory: async () => {
    if (get().status === "loading") return;
    set({ status: "loading", error: null });
    try {
      const boards = await listBoards();
      set({ boards, status: "ready", error: null });
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to load boards.";
      set({ boards: [], status: "ready", error: msg });
    }
  },
  createBoard: async (name: string) => {
    const board = await apiCreateBoard(name);
    set((state) => ({
      boards: [board, ...(state.boards ?? [])],
    }));
    return board;
  },
}));
