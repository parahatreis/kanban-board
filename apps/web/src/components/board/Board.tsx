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
import { Search } from "lucide-react";
import { useState } from "react";
import { useBoardStore, getCanDrag } from "@/stores/board-store";
import { CardFormDialog } from "@/components/cards/CardFormDialog";
import { FilterBar } from "@/components/filters/FilterBar";
import { Column } from "@/components/board/Column";
import { BoardWorkspaceChrome } from "@/components/board/BoardWorkspaceChrome";
import { CardPreview } from "@/components/board/Card";

export function Board() {
  const board = useBoardStore((s) => s.board);
  const boardId = useBoardStore((s) => s.boardId);
  const columns = useBoardStore((s) => s.columns);
  const cards = useBoardStore((s) => s.cards);
  const moveCard = useBoardStore((s) => s.moveCard);
  const reorderInColumn = useBoardStore((s) => s.reorderInColumn);
  const canDrag = useBoardStore((s) => getCanDrag(s));
  const [createOpen, setCreateOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
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

  function openCreate(columnId?: string) {
    setCreateColumnId(columnId ?? null);
    setCreateOpen(true);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <BoardWorkspaceChrome
          boardName={board.name}
          filterSlot={<FilterBar />}
          searchSlot={
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search tasks…"
                className="h-8 w-full rounded-lg border border-border/80 bg-background pl-8 pr-2.5 text-xs text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                aria-label="Search tasks (visual only)"
                readOnly
              />
            </div>
          }
          onAddTask={() => openCreate()}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-6 pt-2 sm:px-6 lg:px-8">
          <div className="mb-2 shrink-0 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Columns
            </h2>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 items-stretch gap-4 overflow-x-auto overflow-y-hidden pb-2 pt-1 [scrollbar-gutter:stable]">
            {columns.map((col) => (
              <Column
                key={col.id}
                column={col}
                onAddTask={() => openCreate(col.id)}
              />
            ))}
          </div>
        </div>

        <CardFormDialog
          mode="create"
          boardId={boardId}
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setCreateColumnId(null);
          }}
          defaultColumnId={createColumnId ?? undefined}
        />
      </div>
      <DragOverlay dropAnimation={null}>
        {canDrag && activeCard ? (
          <div className="w-[min(100vw-2rem,320px)] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_0_rgb(0_0_0_/_0.1),0_1px_2px_-1px_rgb(0_0_0_/_0.1)] ring-2 ring-primary/15">
            <CardPreview card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
