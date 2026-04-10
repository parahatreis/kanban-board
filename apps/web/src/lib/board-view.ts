import type { CardRow } from "shared";

/** Internal key for cards with empty or whitespace-only `label`. */
export const EMPTY_LABEL_KEY = "__empty__";

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

export type LabelCardGroup = {
  labelKey: string;
  displayLabel: string;
  cards: CardRow[];
};

/**
 * Partition filtered column cards into label buckets for section layout.
 * Groups are ordered alphabetically by label; **No label** is last.
 */
export function groupCardsByLabelForColumn(
  cards: CardRow[],
  columnId: string,
  labelFilter: string,
): LabelCardGroup[] {
  const filtered = filterCardsForColumn(cards, columnId, labelFilter);
  const map = new Map<string, CardRow[]>();
  for (const c of filtered) {
    const key = c.label.trim() ? c.label.trim() : EMPTY_LABEL_KEY;
    const arr = map.get(key) ?? [];
    arr.push(c);
    map.set(key, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.position - b.position);
  }
  const keys = [...map.keys()].sort((a, b) => {
    if (a === EMPTY_LABEL_KEY) return 1;
    if (b === EMPTY_LABEL_KEY) return -1;
    return a.localeCompare(b);
  });
  return keys.map((labelKey) => ({
    labelKey,
    displayLabel: labelKey === EMPTY_LABEL_KEY ? "No label" : labelKey,
    cards: map.get(labelKey)!,
  }));
}
