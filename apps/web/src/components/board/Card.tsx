import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  Calendar,
  Check,
  FileText,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CardRow } from "shared";
import {
  Card as CardSurface,
  CardContent,
} from "@/components/ui/card";
import { CardFormDialog } from "@/components/cards/CardFormDialog";
import {
  assigneeAvatarGradient,
  getCardUiMeta,
  type CardStatusKind,
} from "@/lib/card-display";
import { cn } from "@/lib/utils";

const cardShadow =
  "shadow-[0_1px_1px_0_rgb(0_0_0_/_0.05),0_1px_1px_-1px_rgb(0_0_0_/_0.05)]";

function CardStatusIcon({ kind }: { kind: CardStatusKind }) {
  const wrap =
    "flex size-7 shrink-0 items-center justify-center rounded-full border bg-background";
  const Icon =
    kind === "alert"
      ? AlertCircle
      : kind === "success"
        ? Check
        : kind === "file"
          ? FileText
          : kind === "mail"
            ? Mail
            : Phone;

  return (
    <div
      className={cn(
        wrap,
        kind === "alert" && "border-red-200 bg-red-50",
        kind === "success" && "border-emerald-200 bg-emerald-50",
        (kind === "file" || kind === "mail" || kind === "phone") &&
          "border-border/80 bg-muted/40",
      )}
      aria-hidden
    >
      <Icon
        className={cn(
          "size-3.5",
          kind === "alert" && "text-red-500",
          kind === "success" && "text-emerald-600",
          (kind === "file" || kind === "mail" || kind === "phone") &&
            "text-muted-foreground",
        )}
        strokeWidth={2}
      />
    </div>
  );
}

export function CardPreview({ card }: { card: CardRow }) {
  const { kind, urgent, assigneeName, commentCount, dueShort } =
    getCardUiMeta(card.id);
  const desc =
    card.description.trim() ||
    "Add a short description for this task in the editor.";
  const avatarGrad = assigneeAvatarGradient(card.id);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug tracking-tight text-foreground">
            {card.title}
          </h3>
          <CardStatusIcon kind={kind} />
        </div>
        <p className="text-xs leading-snug text-muted-foreground truncate">
          {desc}
        </p>
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border/70 bg-muted/35 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "size-4 shrink-0 rounded-full bg-gradient-to-br shadow-sm ring-2 ring-background",
              avatarGrad,
            )}
            aria-hidden
          />
          <span className="truncate text-[11px] font-medium text-muted-foreground">
            {assigneeName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] tabular-nums",
              urgent ? "text-red-500" : "text-muted-foreground",
            )}
          >
            <Calendar
              className={cn("size-3.5 shrink-0", urgent ? "text-red-500" : "")}
              strokeWidth={1.75}
              aria-hidden
            />
            <span>{dueShort}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
            <MessageSquare className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{commentCount}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Card({
  card,
  dragDisabled,
}: {
  card: CardRow;
  dragDisabled: boolean;
}) {
  if (dragDisabled) {
    return <StaticCard card={card} />;
  }
  return <SortableCardInner card={card} />;
}

function StaticCard({ card }: { card: CardRow }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <CardSurface
        className={cn(
          "cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card transition-all",
          cardShadow,
          "hover:border-border hover:shadow-md hover:bg-muted/20",
        )}
        onClick={() => setEditOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setEditOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <CardContent className="p-0">
          <CardPreview card={card} />
        </CardContent>
      </CardSurface>
      <CardFormDialog
        mode="edit"
        card={card}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

function SortableCardInner({ card }: { card: CardRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const prevDragging = useRef(false);
  const skipNextClick = useRef(false);

  useEffect(() => {
    if (prevDragging.current && !isDragging) {
      skipNextClick.current = true;
    }
    prevDragging.current = isDragging;
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  function openEdit() {
    if (skipNextClick.current) {
      skipNextClick.current = false;
      return;
    }
    setEditOpen(true);
  }

  return (
    <>
      <CardSurface
        ref={setNodeRef}
        style={style}
        className={cn(
          "cursor-grab touch-none overflow-hidden rounded-2xl border border-border/80 bg-card transition-all",
          cardShadow,
          "hover:border-border hover:shadow-md hover:bg-muted/15",
          isDragging && "cursor-grabbing",
        )}
        {...attributes}
        {...listeners}
        onClick={openEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setEditOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <CardContent className="p-0">
          <CardPreview card={card} />
        </CardContent>
      </CardSurface>
      <CardFormDialog
        mode="edit"
        card={card}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
