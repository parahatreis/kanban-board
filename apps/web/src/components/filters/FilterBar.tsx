import { useMemo } from "react";
import { useBoardStore, getCanDrag } from "@/stores/board-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterBar() {
  const cards = useBoardStore((s) => s.cards);
  const labelFilter = useBoardStore((s) => s.labelFilter);
  const setLabelFilter = useBoardStore((s) => s.setLabelFilter);
  const groupBy = useBoardStore((s) => s.groupBy);
  const setGroupBy = useBoardStore((s) => s.setGroupBy);
  const canDrag = useBoardStore((s) => getCanDrag(s));

  const labelOptions = useMemo(() => {
    return Array.from(
      new Set(cards.map((c) => c.label).filter((l) => l.trim().length > 0)),
    ).sort();
  }, [cards]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {!canDrag ? (
        <p className="w-full text-[10px] leading-relaxed text-muted-foreground sm:order-first">
          Drag and drop is paused while a label filter or label grouping is active.
        </p>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Select
          value={labelFilter.length ? labelFilter : "__all__"}
          onValueChange={(v) => setLabelFilter(v === "__all__" ? "" : v)}
        >
          <SelectTrigger
            className="h-8 w-full min-w-[140px] max-w-[220px] border-border bg-card text-xs sm:w-[200px]"
            aria-label="Filter by label"
          >
            <SelectValue placeholder="All labels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All labels</SelectItem>
            {labelOptions.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={groupBy}
          onValueChange={(v) => {
            if (v === "none" || v === "label") setGroupBy(v);
          }}
        >
          <SelectTrigger
            className="h-8 w-full min-w-[140px] max-w-[200px] border-border bg-card text-xs sm:w-[180px]"
            aria-label="Group cards by"
          >
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No grouping</SelectItem>
            <SelectItem value="label">Group By Label</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
