import { useParams } from "react-router-dom";
import { Board } from "@/components/board/Board";
import { DEMO_BOARD_ID } from "@/mocks/demo-board";

export function BoardPage() {
  const { boardId } = useParams();

  if (boardId !== DEMO_BOARD_ID) {
    return (
      <main className="p-6">
        <p className="text-muted-foreground">Board not found.</p>
      </main>
    );
  }

  return (
    <main className="p-6 flex-1">
      <Board />
    </main>
  );
}
