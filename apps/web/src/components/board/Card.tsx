import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CardRow, UserRow } from "shared";
import {
  Card as CardSurface,
  CardContent,
} from "@/components/ui/card";
import { CardFormDialog } from "@/components/cards/CardFormDialog";
import {
  assigneeAvatarGradient,
  initialsFromUser,
} from "@/lib/card-display";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";

const cardShadow =
  "shadow-[0_1px_1px_0_rgb(0_0_0_/_0.05),0_1px_1px_-1px_rgb(0_0_0_/_0.05)]";

function formatCardShortDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(d);
  } catch {
    return String(d);
  }
}

function resolveAssignee(
  assigneeUserId: string | null,
  users: UserRow[],
): { label: string; gradientKey: string; initials: string } | null {
  if (!assigneeUserId) return null;
  const u = users.find((x) => x.id === assigneeUserId);
  if (!u) {
    return {
      label: "Unknown user",
      gradientKey: assigneeUserId,
      initials: "?",
    };
  }
  return {
    label: u.displayName?.trim() || u.email,
    gradientKey: u.id,
    initials: initialsFromUser(u.displayName, u.email),
  };
}

export function CardPreview({
  card,
  users,
}: {
  card: CardRow;
  users: UserRow[];
}) {
  const assignee = resolveAssignee(card.assigneeUserId ?? null, users);
  const desc = card.description.trim();
  const gradientKey = assignee?.gradientKey ?? card.id;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 p-4">
        <h3 className="min-w-0 text-sm font-semibold leading-snug tracking-tight text-foreground">
          {card.title}
        </h3>
        {desc ? (
          <p className="text-xs leading-snug text-muted-foreground line-clamp-3">
            {desc}
          </p>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/35 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white shadow-sm ring-2 ring-background",
              assigneeAvatarGradient(gradientKey),
            )}
            aria-hidden
          >
            {assignee ? assignee.initials : "—"}
          </div>
          <span className="min-w-0 truncate text-[11px] font-medium text-muted-foreground">
            {assignee ? assignee.label : "Unassigned"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <time dateTime={card.createdAt.toISOString()}>
            {formatCardShortDate(card.createdAt)}
          </time>
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
  const users = useBoardStore((s) => s.users);

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
          <CardPreview card={card} users={users} />
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
  const users = useBoardStore((s) => s.users);
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
          <CardPreview card={card} users={users} />
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
