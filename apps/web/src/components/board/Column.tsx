import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import { useMemo } from "react";
import type { ColumnRow } from "shared";
import { useBoardStore, getCanDrag } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/board/Card";

export function Column({
  column,
  onAddTask,
}: {
  column: ColumnRow;
  onAddTask: () => void;
}) {
  const cards = useBoardStore((s) => s.cards);
  const labelFilter = useBoardStore((s) => s.labelFilter);
  const canDrag = useBoardStore((s) => getCanDrag(s));

  const columnCards = useMemo(() => {
    let list = cards.filter((c) => c.columnId === column.id);
    if (labelFilter) {
      list = list.filter((c) => c.label === labelFilter);
    }
    return list.sort((a, b) => a.position - b.position);
  }, [cards, column.id, labelFilter]);

  const cardIds = useMemo(
    () => columnCards.map((c) => c.id),
    [columnCards],
  );

  const { setNodeRef } = useDroppable({
    id: `col-${column.id}`,
    disabled: !canDrag,
  });

  return (
    <section className="flex w-[min(100%,320px)] min-w-[min(100%,280px)] max-w-[320px] shrink-0 flex-col self-stretch rounded-xl bg-card">
      <div className="shrink-0 flex items-center gap-2 border-b border-border/60 px-3 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-[13px] leading-tight tracking-tight text-foreground">
            {column.title}
            <span className="ml-1.5 font-medium text-muted-foreground">
              ({columnCards.length})
            </span>
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground"
          aria-label="Column options"
        >
          <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-2 py-2"
      >
        <div className="flex flex-col gap-2">
          {canDrag
            ? (
              <SortableContext
                items={cardIds}
                strategy={verticalListSortingStrategy}
              >
                {columnCards.map((card) => (
                  <Card key={card.id} card={card} dragDisabled={false} />
                ))}
              </SortableContext>
            )
            : (
              columnCards.map((card) => (
                <Card key={card.id} card={card} dragDisabled />
              ))
            )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border/60 p-2">
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-full justify-start gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          onClick={onAddTask}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
          Add new task
        </Button>
      </div>
    </section>
  );
}
