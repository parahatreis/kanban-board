import { useMemo } from "react";
import type { ColumnRow } from "shared";
import { useBoardStore } from "@/stores/board-store";
import { Card } from "@/components/board/Card";

export function Column({ column }: { column: ColumnRow }) {
  const cards = useBoardStore((s) => s.cards);
  const labelFilter = useBoardStore((s) => s.labelFilter);
  const groupBy = useBoardStore((s) => s.groupBy);

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

  return (
    <section className="min-w-[min(100%,280px)] w-[280px] shrink-0 flex flex-col rounded-xl border bg-card shadow-sm">
      <div className="border-b px-3 py-2">
        <h2 className="font-semibold text-sm">{column.title}</h2>
      </div>
      <div className="flex flex-col gap-2 p-3 flex-1 min-h-[120px]">
        {groupBy === "label" && labelGroups
          ? labelGroups.map(([label, items]) => (
              <div key={label} className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground px-0.5">
                  {label}
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((card) => (
                    <Card key={card.id} card={card} />
                  ))}
                </div>
              </div>
            ))
          : columnCards.map((card) => <Card key={card.id} card={card} />)}
      </div>
    </section>
  );
}
