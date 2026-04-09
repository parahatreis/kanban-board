import { Link } from "react-router-dom";
import { getDemoBoardMeta } from "@/stores/board-store";

export function HomePage() {
  const { board, boardId } = getDemoBoardMeta();
  return (
    <main className="p-6 max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Boards</h1>
      <p className="text-muted-foreground mb-4">
        Phase 4 uses mock data in the browser. Open the demo board to try the
        UI.
      </p>
      <Link
        to={`/board/${boardId}`}
        className="text-primary font-medium underline underline-offset-4 hover:no-underline"
      >
        {board.name}
      </Link>
    </main>
  );
}
