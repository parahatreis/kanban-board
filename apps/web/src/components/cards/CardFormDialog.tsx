import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "@/api/client";
import { cardCreateFormSchema, type CardCreateForm } from "shared";
import { useBoardStore } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type CardFormDialogProps = {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the create form opens with this column selected (e.g. column “Add task”). */
  defaultColumnId?: string;
};

export function CardFormDialog({
  boardId,
  open,
  onOpenChange,
  defaultColumnId,
}: CardFormDialogProps) {
  const columns = useBoardStore((s) => s.columns);
  const users = useBoardStore((s) => s.users);
  const addCard = useBoardStore((s) => s.addCard);

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
          <DialogTitle>New task</DialogTitle>
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
