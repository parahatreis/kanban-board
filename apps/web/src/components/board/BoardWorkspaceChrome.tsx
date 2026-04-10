import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BoardWorkspaceChrome({
  boardName,
  searchSlot,
  filterSlot,
  onAddTask,
}: {
  boardName: string;
  searchSlot: ReactNode;
  filterSlot: ReactNode;
  onAddTask: () => void;
}) {
  return (
    <div className="shrink-0 border-b border-border/70 bg-background">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {boardName}
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{filterSlot}</div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {searchSlot}
            <Button
              type="button"
              onClick={onAddTask}
              size="sm"
              className="h-8 w-full shrink-0 gap-1.5 text-xs shadow-md sm:w-auto"
            >
              <Plus className="size-3.5" />
              Add task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
