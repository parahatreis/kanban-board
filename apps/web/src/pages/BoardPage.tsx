import { useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Board } from "@/components/board/Board";
import { isKnownBoardId } from "@/mocks/board-datasets";
import { useBoardStore } from "@/stores/board-store";

export function BoardPage() {
  const { boardId } = useParams();
  const loadBoard = useBoardStore((s) => s.loadBoard);

  useLayoutEffect(() => {
    if (!boardId || !isKnownBoardId(boardId)) return;
    loadBoard(boardId);
  }, [boardId, loadBoard]);

  if (!boardId || !isKnownBoardId(boardId)) {
    return (
      <main className="flex flex-1 flex-col overflow-hidden p-6">
        <p className="text-xs text-muted-foreground">Board not found.</p>
        <Link to="/" className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline">
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
