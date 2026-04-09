import { Filter } from "lucide-react";
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
          Drag and drop is paused while a label filter is active.
        </p>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Select
          value={labelFilter.length ? labelFilter : "__all__"}
          onValueChange={(v) => setLabelFilter(v === "__all__" ? "" : v)}
        >
          <SelectTrigger
            className="h-8 w-full min-w-[140px] max-w-[220px] border-border/80 bg-background text-xs shadow-sm sm:w-[200px]"
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
      </div>
    </div>
  );
}
