import type { CardRow } from "shared";

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Assign contiguous positions 0..n-1 for cards in `orderedIds` order (same column). */
export function applyReorderInColumn(
  cards: CardRow[],
  columnId: string,
  orderedIds: string[],
): CardRow[] {
  const inCol = cards.filter((c) => c.columnId === columnId);
  if (inCol.length !== orderedIds.length) return cards;
  const colIds = new Set(inCol.map((c) => c.id));
  for (const id of orderedIds) {
    if (!colIds.has(id)) return cards;
  }
  const pos = new Map(orderedIds.map((id, i) => [id, i] as const));
  return cards.map((c) =>
    c.columnId === columnId && pos.has(c.id)
      ? { ...c, position: pos.get(c.id)! }
      : c,
  );
}

/**
 * Move a card to `targetColumnId` at `targetIndex` (0-based index in the column after the move).
 * Renormalizes positions in affected columns.
 */
export function applyMove(
  cards: CardRow[],
  cardId: string,
  targetColumnId: string,
  targetIndex: number,
): CardRow[] {
  const moving = cards.find((c) => c.id === cardId);
  if (!moving) return cards;

  if (moving.columnId === targetColumnId) {
    const ordered = cards
      .filter((c) => c.columnId === targetColumnId)
      .sort((a, b) => a.position - b.position);
    const ids = ordered.map((c) => c.id);
    const from = ids.indexOf(cardId);
    if (from === -1) return cards;
    const to = Math.max(0, Math.min(targetIndex, ids.length - 1));
    if (from === to) return cards;
    const nextIds = arrayMove(ids, from, to);
    return applyReorderInColumn(cards, targetColumnId, nextIds);
  }

  const others = cards.filter((c) => c.id !== cardId);

  const targetBefore = others
    .filter((c) => c.columnId === targetColumnId)
    .sort((a, b) => a.position - b.position);
  const insertAt = Math.max(0, Math.min(targetIndex, targetBefore.length));
  const newTargetCards = [
    ...targetBefore.slice(0, insertAt),
    { ...moving, columnId: targetColumnId },
    ...targetBefore.slice(insertAt),
  ].map((c, i) => ({ ...c, position: i }));

  const sourceAfter = others
    .filter((c) => c.columnId === moving.columnId)
    .sort((a, b) => a.position - b.position)
    .map((c, i) => ({ ...c, position: i }));

  const map = new Map<string, CardRow>();
  for (const c of cards) {
    if (c.id === cardId) continue;
    if (c.columnId !== moving.columnId && c.columnId !== targetColumnId) {
      map.set(c.id, c);
    }
  }
  for (const c of sourceAfter) map.set(c.id, c);
  for (const c of newTargetCards) map.set(c.id, c);

  return cards.map((c) => map.get(c.id) ?? c);
}
