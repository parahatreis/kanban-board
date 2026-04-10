import { useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { Board } from "@/components/board/Board";
import { useBoardStore } from "@/stores/board-store";

const uuidSchema = z.string().uuid();

function isBoardUuid(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

export function BoardPage() {
  const { boardId } = useParams();
  const loadBoard = useBoardStore((s) => s.loadBoard);
  const loadStatus = useBoardStore((s) => s.loadStatus);
  const loadError = useBoardStore((s) => s.loadError);

  useLayoutEffect(() => {
    if (!boardId || !isBoardUuid(boardId)) return;
    void loadBoard(boardId);
  }, [boardId, loadBoard]);

  if (!boardId || !isBoardUuid(boardId)) {
    return (
      <main className="flex flex-1 flex-col overflow-hidden p-6">
        <p className="text-xs text-muted-foreground">Board not found.</p>
        <Link
          to="/"
          className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to boards
        </Link>
      </main>
    );
  }

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden p-6">
        <p className="text-xs text-muted-foreground">Loading board…</p>
      </main>
    );
  }

  if (loadStatus === "not_found") {
    return (
      <main className="flex flex-1 flex-col overflow-hidden p-6">
        <p className="text-xs text-muted-foreground">Board not found.</p>
        <Link
          to="/"
          className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to boards
        </Link>
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className="flex flex-1 flex-col overflow-hidden p-6">
        <p className="text-xs text-destructive">{loadError ?? "Could not load this board."}</p>
        <Link
          to="/"
          className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to boards
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Board />
    </main>
  );
}
