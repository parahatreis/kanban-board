import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  MeasuringStrategy,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/api/client";
import { useBoardStore, getCanDrag } from "@/stores/board-store";
import { CardFormDialog } from "@/components/cards/CardFormDialog";
import { FilterBar } from "@/components/filters/FilterBar";
import { Column } from "@/components/board/Column";
import { BoardWorkspaceChrome } from "@/components/board/BoardWorkspaceChrome";
import { CardPreview } from "@/components/board/Card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const addColumnSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type AddColumnValues = z.infer<typeof addColumnSchema>;

function BoardSearchField() {
  const boardId = useBoardStore((s) => s.boardId);
  const boardSearchQuery = useBoardStore((s) => s.boardSearchQuery);
  const setBoardSearchQuery = useBoardStore((s) => s.setBoardSearchQuery);
  const [localSearch, setLocalSearch] = useState(boardSearchQuery);

  useEffect(() => {
    setLocalSearch(boardSearchQuery);
  }, [boardSearchQuery, boardId]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (localSearch !== boardSearchQuery) {
        setBoardSearchQuery(localSearch);
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [localSearch, boardSearchQuery, setBoardSearchQuery]);

  return (
    <div className="relative w-full sm:w-72">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search tasks…"
        className="h-8 w-full rounded-lg border border-border/80 bg-background py-2 pl-8 pr-2.5 text-xs text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 sm:h-9"
        aria-label="Search tasks by title or description"
      />
    </div>
  );
}

/**
 * `closestCorners` alone loses empty column drops: nested column sortables + card
 * droppables compete, and empty lists have no card rects. Prefer targets the
 * pointer is inside, then the smallest rect (card > col droppable > column shell).
 */
const boardCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    const sorted = [...pointerHits].sort((a, b) => {
      const ra = args.droppableRects.get(a.id);
      const rb = args.droppableRects.get(b.id);
      const areaA = ra ? ra.width * ra.height : Number.POSITIVE_INFINITY;
      const areaB = rb ? rb.width * rb.height : Number.POSITIVE_INFINITY;
      return areaA - areaB;
    });
    const first = sorted[0];
    if (first) return [first];
  }
  return closestCorners(args);
};

export function Board() {
  const board = useBoardStore((s) => s.board);
  const boardId = useBoardStore((s) => s.boardId);
  const columns = useBoardStore((s) => s.columns);
  const cards = useBoardStore((s) => s.cards);
  const users = useBoardStore((s) => s.users);
  const moveCard = useBoardStore((s) => s.moveCard);
  const reorderInColumn = useBoardStore((s) => s.reorderInColumn);
  const reorderColumns = useBoardStore((s) => s.reorderColumns);
  const addColumn = useBoardStore((s) => s.addColumn);
  const canDrag = useBoardStore((s) => getCanDrag(s));
  const [createOpen, setCreateOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [dndError, setDndError] = useState<string | null>(null);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [addColumnPending, setAddColumnPending] = useState(false);
  const [addColumnErr, setAddColumnErr] = useState<string | null>(null);
  const loadBoard = useBoardStore((s) => s.loadBoard);

  const addColForm = useForm<AddColumnValues>({
    resolver: zodResolver(addColumnSchema),
    defaultValues: { title: "" },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columnIds = columns.map((c) => c.id);

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (columns.some((c) => c.id === id)) {
      setActiveColumnId(id);
      setActiveId(null);
    } else {
      setActiveId(id);
      setActiveColumnId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveColumnId(null);
    if (!over) return;

    const state = useBoardStore.getState();
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr === overIdStr) return;

    const isColumnDrag = state.columns.some((c) => c.id === activeIdStr);
    if (isColumnDrag) {
      /** Droppables use `col-${id}`; cards use their own id — map both to a column id. */
      let overColumnId = overIdStr;
      if (overIdStr.startsWith("col-")) {
        overColumnId = overIdStr.slice(4);
      } else {
        const overAsCard = state.cards.find((c) => c.id === overIdStr);
        if (overAsCard) {
          overColumnId = overAsCard.columnId;
        }
      }
      if (!state.columns.some((c) => c.id === overColumnId)) return;
      void (async () => {
        try {
          const orderedIds = [...state.columns]
            .sort((a, b) => a.position - b.position)
            .map((c) => c.id);
          const oldIndex = orderedIds.indexOf(activeIdStr);
          const newIndex = orderedIds.indexOf(overColumnId);
          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
          await reorderColumns(arrayMove(orderedIds, oldIndex, newIndex));
          setDndError(null);
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : "Could not reorder columns.";
          setDndError(msg);
          try {
            await loadBoard(boardId, { silent: true });
          } catch {
            /* ignore */
          }
        }
      })();
      return;
    }

    if (!getCanDrag(state)) return;

    const activeCard = state.cards.find((c) => c.id === activeIdStr);
    if (!activeCard) return;

    void (async () => {
      try {
        /** Card droppables use `col-${id}`; sortable columns use raw column id — both mean “drop into this column”. */
        let targetColumnIdFromDrop: string | null = null;
        if (overIdStr.startsWith("col-")) {
          targetColumnIdFromDrop = overIdStr.slice(4);
        } else if (state.columns.some((c) => c.id === overIdStr)) {
          targetColumnIdFromDrop = overIdStr;
        }

        if (targetColumnIdFromDrop) {
          const targetColumnId = targetColumnIdFromDrop;
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
              await reorderInColumn(targetColumnId, arrayMove(ids, oldIndex, newIndex));
            }
          } else {
            await moveCard(activeIdStr, {
              columnId: targetColumnId,
              position: targetIndex,
            });
          }
          setDndError(null);
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
          await reorderInColumn(colId, arrayMove(ids, oldIndex, newIndex));
          setDndError(null);
          return;
        }

        const targetCards = state.cards
          .filter((c) => c.columnId === overCard.columnId && c.id !== activeIdStr)
          .sort((a, b) => a.position - b.position);
        const targetIndex = targetCards.findIndex((c) => c.id === overIdStr);
        await moveCard(activeIdStr, {
          columnId: overCard.columnId,
          position: Math.max(0, targetIndex),
        });
        setDndError(null);
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not update the board.";
        setDndError(msg);
        try {
          await loadBoard(boardId, { silent: true });
        } catch {
          /* ignore */
        }
      }
    })();
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveColumnId(null);
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;
  const activeColumn = activeColumnId
    ? columns.find((c) => c.id === activeColumnId)
    : null;

  const onAddColumnSubmit = addColForm.handleSubmit(async (data) => {
    setAddColumnErr(null);
    setAddColumnPending(true);
    try {
      await addColumn(data.title);
      setAddColumnOpen(false);
      addColForm.reset({ title: "" });
    } catch (e) {
      setAddColumnErr(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not add column.",
      );
    } finally {
      setAddColumnPending(false);
    }
  });

  if (!board) {
    return null;
  }

  function openCreate(columnId?: string) {
    setCreateColumnId(columnId ?? null);
    setCreateOpen(true);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollisionDetection}
      measuring={{
        droppable: { strategy: MeasuringStrategy.Always },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <BoardWorkspaceChrome
          boardName={board.name}
          filterSlot={<FilterBar />}
          searchSlot={<BoardSearchField />}
          onAddTask={() => openCreate()}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-6 pt-2 sm:px-6 lg:px-8">
          <div className="mb-2 shrink-0 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Columns
            </h2>
          </div>
          {dndError ? (
            <p className="mb-2 text-xs text-destructive" role="alert">
              {dndError}
            </p>
          ) : null}
          <div className="flex min-h-0 min-w-0 flex-1 items-stretch gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 pt-1 [scrollbar-gutter:stable]">
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((col) => (
                <Column
                  key={col.id}
                  column={col}
                  onAddTask={() => openCreate(col.id)}
                />
              ))}
            </SortableContext>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-[120px] w-[min(100%,200px)] shrink-0 flex-col gap-2 self-stretch border-dashed py-6 text-xs font-medium text-muted-foreground"
              onClick={() => {
                setAddColumnErr(null);
                addColForm.reset({ title: "" });
                setAddColumnOpen(true);
              }}
            >
              <Plus className="size-5" strokeWidth={1.75} />
              Add column
            </Button>
          </div>
        </div>

        <CardFormDialog
          boardId={boardId}
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setCreateColumnId(null);
          }}
          defaultColumnId={createColumnId ?? undefined}
        />

        <Dialog open={addColumnOpen} onOpenChange={setAddColumnOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New column</DialogTitle>
              <DialogDescription>Add a column to this board.</DialogDescription>
            </DialogHeader>
            <form onSubmit={onAddColumnSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="new-column-title">Title</Label>
                <Input
                  id="new-column-title"
                  autoFocus
                  {...addColForm.register("title")}
                />
                {addColForm.formState.errors.title ? (
                  <p className="text-sm text-destructive">
                    {addColForm.formState.errors.title.message}
                  </p>
                ) : null}
              </div>
              {addColumnErr ? (
                <p className="text-sm text-destructive" role="alert">
                  {addColumnErr}
                </p>
              ) : null}
              <DialogFooter>
                <Button type="submit" disabled={addColumnPending}>
                  {addColumnPending ? "Adding…" : "Add column"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeColumn ? (
          <div className="flex w-[min(100vw-2rem,320px)] min-w-[min(100%,280px)] max-w-[320px] flex-col rounded-xl border border-border/80 bg-card p-4 opacity-95 shadow-lg ring-2 ring-primary/20">
            <p className="font-semibold text-sm text-foreground">{activeColumn.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Column</p>
          </div>
        ) : null}
        {canDrag && activeCard ? (
          <div className="w-[min(100vw-2rem,320px)] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_0_rgb(0_0_0_/_0.1),0_1px_2px_-1px_rgb(0_0_0_/_0.1)] ring-2 ring-primary/15">
            <CardPreview card={activeCard} users={users} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
