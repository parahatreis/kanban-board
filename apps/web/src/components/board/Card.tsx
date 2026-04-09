import { useState } from "react";
import type { CardRow } from "shared";
import {
  Card as CardSurface,
  CardContent,
} from "@/components/ui/card";
import { CardFormDialog } from "@/components/cards/CardFormDialog";

export function Card({ card }: { card: CardRow }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <CardSurface
        className="cursor-pointer transition-colors hover:bg-muted/50"
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
