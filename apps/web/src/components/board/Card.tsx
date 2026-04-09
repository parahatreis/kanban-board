import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import type { CardRow } from "shared";
import {
  Card as CardSurface,
  CardContent,
} from "@/components/ui/card";
import { CardFormDialog } from "@/components/cards/CardFormDialog";
import { cn } from "@/lib/utils";

export function CardPreview({ card }: { card: CardRow }) {
  return (
    <>
      <div className="font-medium text-sm leading-snug">{card.title}</div>
      {card.description ? (
        <p className="text-xs text-muted-foreground line-clamp-3 mt-1.5">
          {card.description}
        </p>
      ) : null}
      {card.label ? (
        <span className="inline-block mt-2 text-[11px] rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
          {card.label}
        </span>
      ) : null}
    </>
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
        className="cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md border-border/80"
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
        <CardContent className="p-3">
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
          "cursor-grab touch-none transition-all border-border/80 hover:bg-muted/50 hover:shadow-md",
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
        <CardContent className="p-3">
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
