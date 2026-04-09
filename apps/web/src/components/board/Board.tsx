import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { DEMO_BOARD_ID, demoBoard } from "@/mocks/demo-board";
import { useBoardStore, getCanDrag } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { CardFormDialog } from "@/components/cards/CardFormDialog";
import { FilterBar } from "@/components/filters/FilterBar";
import { Column } from "@/components/board/Column";
import { CardPreview } from "@/components/board/Card";

export function Board() {
  const columns = useBoardStore((s) => s.columns);
  const cards = useBoardStore((s) => s.cards);
  const moveCard = useBoardStore((s) => s.moveCard);
  const reorderInColumn = useBoardStore((s) => s.reorderInColumn);
  const canDrag = useBoardStore((s) => getCanDrag(s));
  const [createOpen, setCreateOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const state = useBoardStore.getState();
    if (!getCanDrag(state)) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr === overIdStr) return;

    const activeCard = state.cards.find((c) => c.id === activeIdStr);
    if (!activeCard) return;

    if (overIdStr.startsWith("col-")) {
      const targetColumnId = overIdStr.slice(4);
      const targetCards = state.cards
        .filter((c) => c.columnId === targetColumnId && c.id !== activeIdStr)
        .sort((a, b) => a.position - b.position);
      const targetIndex = targetCards.length;

      if (activeCard.columnId === targetColumnId) {
        const ids = state.cards
          .filter((c) => c.columnId === targetColumnId)
          .sort((a, b) => a.position - b.position)
          .map((c) => c.id);
        const oldIndex = ids.indexOf(activeIdStr);
        const newIndex = ids.length - 1;
        if (oldIndex !== -1 && oldIndex !== newIndex) {
          reorderInColumn(targetColumnId, arrayMove(ids, oldIndex, newIndex));
        }
      } else {
        moveCard(activeIdStr, { columnId: targetColumnId, position: targetIndex });
      }
      return;
    }

    const overCard = state.cards.find((c) => c.id === overIdStr);
    if (!overCard) return;

    if (activeCard.columnId === overCard.columnId) {
      const colId = activeCard.columnId;
      const ids = state.cards
        .filter((c) => c.columnId === colId)
        .sort((a, b) => a.position - b.position)
        .map((c) => c.id);
      const oldIndex = ids.indexOf(activeIdStr);
      const newIndex = ids.indexOf(overIdStr);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      reorderInColumn(colId, arrayMove(ids, oldIndex, newIndex));
      return;
    }

    const targetCards = state.cards
      .filter((c) => c.columnId === overCard.columnId && c.id !== activeIdStr)
      .sort((a, b) => a.position - b.position);
    const targetIndex = targetCards.findIndex((c) => c.id === overIdStr);
    moveCard(activeIdStr, {
      columnId: overCard.columnId,
      position: Math.max(0, targetIndex),
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {demoBoard.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Drag cards by the handle to move or reorder. Data stays in the browser until Phase 6.
            </p>
          </div>
          <Button type="button" onClick={() => setCreateOpen(true)} className="shrink-0">
            Add card
          </Button>
        </div>
        <FilterBar />
        <div className="flex gap-5 overflow-x-auto pb-4 pt-5 items-start">
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
      <DragOverlay dropAnimation={null}>
        {canDrag && activeCard ? (
          <div className="w-[260px] rounded-xl border-2 border-primary/30 bg-card p-3 shadow-xl ring-2 ring-primary/20">
            <CardPreview card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
