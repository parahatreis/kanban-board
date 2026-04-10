import type { CardRow } from "shared";

/**
 * Cards in a column, optionally restricted to an exact label match (toolbar filter).
 * Sorted by `position`.
 */
export function filterCardsForColumn(
  cards: CardRow[],
  columnId: string,
  labelFilter: string,
): CardRow[] {
  let list = cards.filter((c) => c.columnId === columnId);
  if (labelFilter.trim()) {
    list = list.filter((c) => c.label === labelFilter);
  }
  return list.sort((a, b) => a.position - b.position);
}
