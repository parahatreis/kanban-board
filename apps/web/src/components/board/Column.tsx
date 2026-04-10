import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnRow } from "shared";
import { filterCardsForColumn } from "@/lib/board-view";
import { useBoardStore, getCanDrag } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/board/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/api/client";

const renameSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type RenameValues = z.infer<typeof renameSchema>;

export function Column({
  column,
  onAddTask,
}: {
  column: ColumnRow;
  onAddTask: () => void;
}) {
  const cards = useBoardStore((s) => s.cards);
  const columns = useBoardStore((s) => s.columns);
  const labelFilter = useBoardStore((s) => s.labelFilter);
  const canDrag = useBoardStore((s) => getCanDrag(s));
  const updateColumn = useBoardStore((s) => s.updateColumn);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const reorderColumns = useBoardStore((s) => s.reorderColumns);

  const sortedColumnIds = useMemo(
    () =>
      [...columns]
        .sort((a, b) => a.position - b.position)
        .map((c) => c.id),
    [columns],
  );
  const columnIndex = sortedColumnIds.indexOf(column.id);
  const canMoveLeft = columnIndex > 0;
  const canMoveRight = columnIndex >= 0 && columnIndex < sortedColumnIds.length - 1;

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  const columnCards = useMemo(
    () => filterCardsForColumn(cards, column.id, labelFilter),
    [cards, column.id, labelFilter],
  );

  const cardIds = useMemo(
    () => columnCards.map((c) => c.id),
    [columnCards],
  );

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `col-${column.id}`,
    disabled: !canDrag,
  });

  const renameForm = useForm<RenameValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: { title: column.title },
  });

  function openRename() {
    renameForm.reset({ title: column.title });
    setRenameOpen(true);
    setError(null);
  }

  async function moveColumn(delta: -1 | 1) {
    setMoveError(null);
    const idx = sortedColumnIds.indexOf(column.id);
    if (idx === -1) return;
    const target = idx + delta;
    if (target < 0 || target >= sortedColumnIds.length) return;
    try {
      await reorderColumns(arrayMove(sortedColumnIds, idx, target));
    } catch (e) {
      setMoveError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not move column.",
      );
    }
  }

  const onRenameSubmit = renameForm.handleSubmit(async (data) => {
    setError(null);
    setPending(true);
    try {
      await updateColumn(column.id, data.title);
      setRenameOpen(false);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not update column.",
      );
    } finally {
      setPending(false);
    }
  });

  return (
    <section
      ref={setSortableRef}
      style={sortableStyle}
      className="flex w-[min(100%,320px)] min-w-[min(100%,280px)] max-w-[320px] shrink-0 flex-col self-stretch rounded-xl bg-card"
    >
      <div className="shrink-0 flex items-center gap-1 border-b border-border/60 px-2 py-2.5">
        <button
          type="button"
          className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted/80 hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder column"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-[13px] leading-tight tracking-tight text-foreground">
            {column.title}
            <span className="ml-1.5 font-medium text-muted-foreground">
              ({columnCards.length})
            </span>
          </h2>
          {moveError ? (
            <p className="mt-0.5 text-[10px] leading-tight text-destructive">{moveError}</p>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground"
              aria-label="Column options"
            >
              <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[11rem]">
            <DropdownMenuItem
              disabled={!canMoveLeft}
              onSelect={() => void moveColumn(-1)}
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              Move left
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!canMoveRight}
              onSelect={() => void moveColumn(1)}
            >
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
              Move right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => openRename()}>
              <Pencil className="size-3.5" strokeWidth={1.75} />
              Rename column
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onSelect={() => {
                setDeleteError(null);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={setDroppableRef}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-2 py-2">
          <div className="flex min-h-[120px] flex-col gap-2">
            {canDrag
              ? (
                columnCards.length === 0
                  ? (
                    <div
                      className="flex min-h-[120px] w-full items-center justify-center px-2 text-center text-[11px] text-muted-foreground"
                      aria-hidden
                    >
                      Drop tasks here
                    </div>
                  )
                  : (
                    <SortableContext
                      items={cardIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnCards.map((card) => (
                        <Card key={card.id} card={card} dragDisabled={false} />
                      ))}
                    </SortableContext>
                  )
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
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename column</DialogTitle>
          </DialogHeader>
          <form onSubmit={onRenameSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor={`rename-col-${column.id}`}>Title</Label>
              <Input
                id={`rename-col-${column.id}`}
                autoFocus
                {...renameForm.register("title")}
              />
              {renameForm.formState.errors.title ? (
                <p className="text-sm text-destructive">
                  {renameForm.formState.errors.title.message}
                </p>
              ) : null}
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this column?</AlertDialogTitle>
            <AlertDialogDescription>
              All tasks in this column will be permanently removed.
              {deleteError ? (
                <span className="mt-2 block text-destructive">{deleteError}</span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void (async () => {
                  setDeleteError(null);
                  setPending(true);
                  try {
                    await deleteColumn(column.id);
                    setDeleteOpen(false);
                  } catch (err) {
                    setDeleteError(
                      err instanceof ApiError
                        ? err.message
                        : err instanceof Error
                          ? err.message
                          : "Could not delete column.",
                    );
                  } finally {
                    setPending(false);
                  }
                })();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
