import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo } from "react";
import type { ColumnRow } from "shared";
import { useBoardStore, getCanDrag } from "@/stores/board-store";
import { Card } from "@/components/board/Card";

export function Column({ column }: { column: ColumnRow }) {
  const cards = useBoardStore((s) => s.cards);
  const labelFilter = useBoardStore((s) => s.labelFilter);
  const groupBy = useBoardStore((s) => s.groupBy);
  const canDrag = useBoardStore((s) => getCanDrag(s));

  const columnCards = useMemo(() => {
    let list = cards.filter((c) => c.columnId === column.id);
    if (labelFilter) {
      list = list.filter((c) => c.label === labelFilter);
    }
    return list.sort((a, b) => a.position - b.position);
  }, [cards, column.id, labelFilter]);

  const labelGroups = useMemo(() => {
    if (groupBy !== "label") return null;
    const map = new Map<string, typeof columnCards>();
    for (const c of columnCards) {
      const key = c.label.trim() ? c.label : "(no label)";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [columnCards, groupBy]);

  const cardIds = useMemo(
    () => columnCards.map((c) => c.id),
    [columnCards],
  );

  const { setNodeRef } = useDroppable({
    id: `col-${column.id}`,
    disabled: !canDrag,
  });

  const showGrouped = groupBy === "label" && labelGroups;

  return (
    <section className="min-w-[min(100%,280px)] w-[280px] shrink-0 flex flex-col rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
      <div className="border-b border-border/60 bg-muted/30 px-3 py-2.5">
        <h2 className="font-semibold text-sm tracking-tight">{column.title}</h2>
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 flex-1 min-h-[140px] p-3"
      >
        {showGrouped
          ? labelGroups!.map(([label, items]) => (
              <div key={label} className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground px-0.5">
                  {label}
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((card) => (
                    <Card key={card.id} card={card} dragDisabled />
                  ))}
                </div>
              </div>
            ))
          : canDrag
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
    </section>
  );
}
