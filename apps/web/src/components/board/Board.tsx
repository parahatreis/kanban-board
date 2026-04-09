import { useState } from "react";
import { DEMO_BOARD_ID, demoBoard } from "@/mocks/demo-board";
import { useBoardStore } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { CardFormDialog } from "@/components/cards/CardFormDialog";
import { FilterBar } from "@/components/filters/FilterBar";
import { Column } from "@/components/board/Column";

export function Board() {
  const columns = useBoardStore((s) => s.columns);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{demoBoard.name}</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Add card
        </Button>
      </div>
      <FilterBar />
      <div className="flex gap-4 overflow-x-auto pb-4 mt-4 items-start">
        {columns.map((col) => (
          <Column key={col.id} column={col} />
        ))}
      </div>
      <CardFormDialog
        mode="create"
        boardId={DEMO_BOARD_ID}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
