import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  cardEditFormSchema,
  type CardEditForm,
  type CardRow,
  type UserRow,
} from "shared";
import {
  createCardComment,
  listCardComments,
  type CardCommentDto,
} from "@/api/card-comments";
import { ApiError } from "@/api/client";
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
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";

function formatCommentDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

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

function authorLabel(c: CardCommentDto, users: UserRow[]): string {
  if (c.author?.displayName?.trim()) return c.author.displayName.trim();
  if (c.author?.email) return c.author.email;
  const u = users.find((x) => x.id === c.userId);
  if (u) return u.displayName?.trim() || u.email;
  return "User";
}

export function CardDetailsSheet({
  card: cardProp,
  users,
  open,
  onOpenChange,
}: {
  card: CardRow;
  users: UserRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const columns = useBoardStore((s) => s.columns);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);

  const cardFromStore = useBoardStore((s) =>
    s.cards.find((c) => c.id === cardProp.id),
  );
  const card = cardFromStore ?? cardProp;

  const columnTitle = useMemo(() => {
    return columns.find((c) => c.id === card.columnId)?.title ?? "—";
  }, [columns, card.columnId]);

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
    if (!open) return;
    form.reset({
      title: card.title,
      description: card.description,
      label: card.label,
      assigneeUserId: card.assigneeUserId ?? null,
    });
  }, [
    open,
    card.id,
    card.title,
    card.description,
    card.label,
    card.assigneeUserId,
    form,
  ]);

  const [comments, setComments] = useState<CardCommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    setPostError(null);
    try {
      const rows = await listCardComments(card.id);
      setComments(rows);
    } catch (e) {
      setComments([]);
      setPostError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }, [card.id]);

  useEffect(() => {
    if (!open) return;
    void loadComments();
    setDraft("");
    setSaveError(null);
  }, [open, loadComments]);

  async function submitComment() {
    const body = draft.trim();
    if (!body) return;
    setPostError(null);
    try {
      await createCardComment(card.id, body);
      setDraft("");
      await loadComments();
    } catch (e) {
      setPostError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not post comment.",
      );
    }
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setSaveError(null);
    setSavePending(true);
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
      setSaveError(msg);
    } finally {
      setSavePending(false);
    }
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex max-h-[min(90vh,900px)] w-[min(100vw-1.5rem,960px)] flex-col gap-0 overflow-hidden rounded-xl p-0 lg:max-w-4xl",
          )}
        >
          <DialogDescription className="sr-only">
            Edit card: title, description, and comments on the left; label, column, assignee
            on the right. Save to apply changes.
          </DialogDescription>
          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <DialogHeader className="shrink-0 space-y-3 border-b border-border/30 px-5 py-4 text-left">
              <DialogTitle className="sr-only">Edit card</DialogTitle>
              <div className="space-y-2 pr-6">
                <Label htmlFor="card-detail-title" className="text-[11px] text-muted-foreground">
                  Title
                </Label>
                <Input
                  id="card-detail-title"
                  className="text-base font-semibold"
                  {...form.register("title")}
                />
                {form.formState.errors.title ? (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                ) : null}
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 px-5 py-4 md:grid-cols-[minmax(0,1fr)_min(280px,32%)] md:items-start md:gap-8">
                <div className="min-w-0 space-y-6">
                  <section aria-labelledby="card-desc-heading">
                    <h2
                      id="card-desc-heading"
                      className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Description
                    </h2>
                    <Textarea
                      id="card-detail-description"
                      rows={8}
                      className="mt-2 min-h-[120px] resize-y text-sm"
                      placeholder="Add a description…"
                      {...form.register("description")}
                    />
                  </section>

                  <section aria-labelledby="card-comments-heading">
                    <h2
                      id="card-comments-heading"
                      className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Comments
                    </h2>
                    {commentsLoading ? (
                      <p className="mt-2 text-xs text-muted-foreground">Loading comments…</p>
                    ) : (
                      <ul className="mt-2 space-y-3">
                        {comments.length === 0 ? (
                          <li className="text-xs text-muted-foreground">No comments yet.</li>
                        ) : (
                          comments.map((c) => (
                            <li
                              key={c.id}
                              className="rounded-lg border border-border/30 bg-card px-3 py-2.5 text-sm"
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2 text-[11px] text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {authorLabel(c, users)}
                                </span>
                                <time dateTime={c.createdAt}>{formatCommentDate(c.createdAt)}</time>
                              </div>
                              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-snug text-foreground">
                                {c.body}
                              </p>
                            </li>
                          ))
                        )}
                      </ul>
                    )}

                    <div className="mt-4 space-y-2">
                      <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write a comment…"
                        rows={3}
                        className="min-h-[72px] resize-y text-sm"
                      />
                      {postError ? (
                        <p className="text-xs text-destructive" role="alert">
                          {postError}
                        </p>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={!draft.trim()}
                        onClick={() => void submitComment()}
                      >
                        Add comment
                      </Button>
                    </div>
                  </section>
                </div>

                <aside
                  className="min-w-0 space-y-4 border-t border-border/30 pt-6 md:border-t-0 md:border-l md:border-border/30 md:pt-0 md:pl-6"
                  aria-labelledby="card-meta-heading"
                >
                  <h2
                    id="card-meta-heading"
                    className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Task info
                  </h2>
                  <div className="space-y-2">
                    <Label htmlFor="card-detail-label">Label</Label>
                    <Input
                      id="card-detail-label"
                      placeholder="e.g. feature, bug"
                      {...form.register("label")}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Column</span>
                    <p className="text-sm text-foreground">{columnTitle}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-detail-assignee">Assignee</Label>
                    <Select
                      value={form.watch("assigneeUserId") ?? "__none__"}
                      onValueChange={(v) =>
                        form.setValue("assigneeUserId", v === "__none__" ? null : v)
                      }
                    >
                      <SelectTrigger id="card-detail-assignee">
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
                  <div className="space-y-1 border-t border-border/30 pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground">Created</span>
                    <p className="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
                      <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                      <time dateTime={card.createdAt.toISOString()}>
                        {formatCardCreatedAt(card.createdAt)}
                      </time>
                    </p>
                  </div>
                </aside>
              </div>
            </div>

            {saveError ? (
              <p className="shrink-0 border-t border-destructive/30 bg-destructive/5 px-5 py-2 text-sm text-destructive" role="alert">
                {saveError}
              </p>
            ) : null}

            <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border/30 bg-accent/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full sm:mr-auto sm:w-auto"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmOpen(true);
                }}
              >
                Delete card
              </Button>
              <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button type="submit" size="sm" disabled={savePending}>
                  {savePending ? "Saving…" : "Save"}
                </Button>
              </div>
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
