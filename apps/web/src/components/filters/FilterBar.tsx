import { useMemo } from "react";
import { useBoardStore, type GroupByMode } from "@/stores/board-store";
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

  const labelOptions = useMemo(() => {
    return Array.from(
      new Set(cards.map((c) => c.label).filter((l) => l.trim().length > 0)),
    ).sort();
  }, [cards]);

  return (
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
  );
}
