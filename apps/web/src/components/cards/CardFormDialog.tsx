import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  cardCreateFormSchema,
  cardEditFormSchema,
  type CardCreateForm,
  type CardEditForm,
  type CardRow,
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
};

type EditProps = {
  mode: "edit";
  card: CardRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type CardFormDialogProps = CreateProps | EditProps;

export function CardFormDialog(props: CardFormDialogProps) {
  const columns = useBoardStore((s) => s.columns);
  const addCard = useBoardStore((s) => s.addCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);

  if (props.mode === "create") {
    return (
      <CreateCardFormInner
        boardId={props.boardId}
        open={props.open}
        onOpenChange={props.onOpenChange}
        columns={columns}
        addCard={addCard}
      />
    );
  }

  return (
    <EditCardFormInner
      card={props.card}
      open={props.open}
      onOpenChange={props.onOpenChange}
      updateCard={updateCard}
      deleteCard={deleteCard}
    />
  );
}

function CreateCardFormInner({
  boardId,
  open,
  onOpenChange,
  columns,
  addCard,
}: {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: { id: string; title: string }[];
  addCard: (input: CardCreateForm) => void;
}) {
  const form = useForm<CardCreateForm>({
    resolver: zodResolver(cardCreateFormSchema),
    defaultValues: {
      boardId,
      columnId: columns[0]?.id ?? "",
      title: "",
      description: "",
      label: "",
    },
  });

  useEffect(() => {
    form.setValue("boardId", boardId);
    if (columns[0]?.id) form.setValue("columnId", columns[0].id);
  }, [boardId, columns, form]);

  const onSubmit = form.handleSubmit((data) => {
    addCard(data);
    onOpenChange(false);
    form.reset({
      boardId,
      columnId: columns[0]?.id ?? "",
      title: "",
      description: "",
      label: "",
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New card</DialogTitle>
          <DialogDescription>
            Add a card to a column. Data stays in the browser (Phase 4 mock).
          </DialogDescription>
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
          <DialogFooter>
            <Button type="submit">Create</Button>
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
  updateCard,
  deleteCard,
}: {
  card: CardRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateCard: (id: string, patch: CardEditForm) => void;
  deleteCard: (id: string) => void;
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const form = useForm<CardEditForm>({
    resolver: zodResolver(cardEditFormSchema),
    defaultValues: {
      title: card.title,
      description: card.description,
      label: card.label,
    },
  });

  useEffect(() => {
    form.reset({
      title: card.title,
      description: card.description,
      label: card.label,
    });
  }, [card, form]);

  const onSubmit = form.handleSubmit((data) => {
    updateCard(card.id, data);
    onOpenChange(false);
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
          <DialogDescription>Update title, description, or label.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete
            </Button>
            <Button type="submit">Save</Button>
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
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              deleteCard(card.id);
              setDeleteConfirmOpen(false);
              onOpenChange(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
