import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "@/api/client";
import {
  cardCreateFormSchema,
  cardEditFormSchema,
  type CardCreateForm,
  type CardEditForm,
  type CardRow,
  type UserRow,
} from "shared";
import { useBoardStore } from "@/stores/board-store";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

type CreateProps = {
  mode: "create";
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the create form opens with this column selected (e.g. column “Add task”). */
  defaultColumnId?: string;
};

type EditProps = {
  mode: "edit";
  card: CardRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type CardFormDialogProps = CreateProps | EditProps;

function formatCardCreatedAt(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return String(d);
  }
}

export function CardFormDialog(props: CardFormDialogProps) {
  const columns = useBoardStore((s) => s.columns);
  const users = useBoardStore((s) => s.users);
  const addCard = useBoardStore((s) => s.addCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);

  if (props.mode === "create") {
    return (
      <CreateCardFormInner
        boardId={props.boardId}
        open={props.open}
        onOpenChange={props.onOpenChange}
        defaultColumnId={props.defaultColumnId}
        columns={columns}
        users={users}
        addCard={addCard}
      />
    );
  }

  return (
    <EditCardFormInner
      card={props.card}
      open={props.open}
      onOpenChange={props.onOpenChange}
      users={users}
      updateCard={updateCard}
      deleteCard={deleteCard}
    />
  );
}

function CreateCardFormInner({
  boardId,
  open,
  onOpenChange,
  defaultColumnId,
  columns,
  users,
  addCard,
}: {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultColumnId?: string;
  columns: { id: string; title: string }[];
  users: UserRow[];
  addCard: (input: CardCreateForm) => Promise<void>;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const form = useForm<CardCreateForm>({
    resolver: zodResolver(cardCreateFormSchema),
    defaultValues: {
      boardId,
      columnId: columns[0]?.id ?? "",
      title: "",
      description: "",
      label: "",
      assigneeUserId: undefined,
    },
  });

  useEffect(() => {
    form.setValue("boardId", boardId);
    const fallback = columns[0]?.id ?? "";
    const preferred =
      defaultColumnId && columns.some((c) => c.id === defaultColumnId)
        ? defaultColumnId
        : fallback;
    if (preferred) form.setValue("columnId", preferred);
  }, [boardId, columns, defaultColumnId, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    setPending(true);
    try {
      await addCard(data);
      onOpenChange(false);
      form.reset({
        boardId,
        columnId: columns[0]?.id ?? "",
        title: "",
        description: "",
        label: "",
        assigneeUserId: undefined,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not create card.";
      setSubmitError(msg);
    } finally {
      setPending(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New card</DialogTitle>
          <DialogDescription>Add a card to a column. Changes are saved to the API.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <input type="hidden" {...form.register("boardId")} />
          <input type="hidden" {...form.register("columnId")} />
          <div className="space-y-2">
            <Label htmlFor="create-column">Column</Label>
            <Select
              value={form.watch("columnId")}
              onValueChange={(v) => form.setValue("columnId", v)}
            >
              <SelectTrigger id="create-column">
                <SelectValue placeholder="Column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.columnId ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.columnId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-title">Title</Label>
            <Input id="create-title" autoFocus {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">Description</Label>
            <Textarea id="create-description" {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-label">Label</Label>
            <Input
              id="create-label"
              placeholder="e.g. feature, bug"
              {...form.register("label")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-assignee">Assignee</Label>
            <Select
              value={form.watch("assigneeUserId") ?? "__none__"}
              onValueChange={(v) =>
                form.setValue("assigneeUserId", v === "__none__" ? undefined : v)
              }
            >
              <SelectTrigger id="create-assignee">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName?.trim() || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCardFormInner({
  card,
  open,
  onOpenChange,
  users,
  updateCard,
  deleteCard,
}: {
  card: CardRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserRow[];
  updateCard: (id: string, patch: CardEditForm) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const form = useForm<CardEditForm>({
    resolver: zodResolver(cardEditFormSchema),
    defaultValues: {
      title: card.title,
      description: card.description,
      label: card.label,
      assigneeUserId: card.assigneeUserId ?? null,
    },
  });

  useEffect(() => {
    form.reset({
      title: card.title,
      description: card.description,
      label: card.label,
      assigneeUserId: card.assigneeUserId ?? null,
    });
  }, [card, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    setPending(true);
    try {
      await updateCard(card.id, data);
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not save card.";
      setSubmitError(msg);
    } finally {
      setPending(false);
    }
  });

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById("edit-title")?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit card</DialogTitle>
          <DialogDescription>Update title, description, label, or assignee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <p className="text-xs text-muted-foreground">
            Created{" "}
            <time dateTime={card.createdAt.toISOString()}>
              {formatCardCreatedAt(card.createdAt)}
            </time>
          </p>
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-label">Label</Label>
            <Input id="edit-label" {...form.register("label")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assignee">Assignee</Label>
            <Select
              value={form.watch("assigneeUserId") ?? "__none__"}
              onValueChange={(v) =>
                form.setValue("assigneeUserId", v === "__none__" ? null : v)
              }
            >
              <SelectTrigger id="edit-assignee">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName?.trim() || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={() => {
                setDeleteError(null);
                setDeleteConfirmOpen(true);
              }}
            >
              Delete
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this card?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the card from the board. You can undo only by recreating it.
            {deleteError ? (
              <span className="mt-2 block text-destructive">{deleteError}</span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deletePending}
            onClick={(e) => {
              e.preventDefault();
              void (async () => {
                setDeleteError(null);
                setDeletePending(true);
                try {
                  await deleteCard(card.id);
                  setDeleteConfirmOpen(false);
                  onOpenChange(false);
                } catch (err) {
                  const msg =
                    err instanceof ApiError
                      ? err.message
                      : err instanceof Error
                        ? err.message
                        : "Could not delete card.";
                  setDeleteError(msg);
                } finally {
                  setDeletePending(false);
                }
              })();
            }}
          >
            {deletePending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
