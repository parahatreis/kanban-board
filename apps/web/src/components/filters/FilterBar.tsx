import { useMemo } from "react";
import {
  useBoardStore,
  getCanDrag,
  type GroupByMode,
} from "@/stores/board-store";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-3">
      {!canDrag ? (
        <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Drag and drop is paused while a label filter is active or cards are grouped by label.
          Clear the filter and set group-by to &quot;None&quot; to move cards.
        </p>
      ) : null}
      <div className="flex flex-wrap items-end gap-6">
      <div className="space-y-2">
        <Label htmlFor="filter-label">Filter by label</Label>
        <Select
          value={labelFilter.length ? labelFilter : "__all__"}
          onValueChange={(v) => setLabelFilter(v === "__all__" ? "" : v)}
        >
          <SelectTrigger id="filter-label" className="w-[200px]">
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
      <div className="space-y-2">
        <Label htmlFor="group-by">Group by</Label>
        <Select
          value={groupBy}
          onValueChange={(v) => setGroupBy(v as GroupByMode)}
        >
          <SelectTrigger id="group-by" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="label">Label</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    </div>
  );
}
