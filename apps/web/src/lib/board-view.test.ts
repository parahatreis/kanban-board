import { describe, expect, it } from "vitest";
import type { CardRow } from "shared";
import { filterCardsForColumn } from "./board-view.js";

function card(
  id: string,
  columnId: string,
  position: number,
  label: string,
): CardRow {
  return {
    id,
    boardId: "b1",
    columnId,
    title: id,
    description: "",
    position,
    label,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    assigneeUserId: null,
    deletedAt: null,
  };
}

describe("filterCardsForColumn", () => {
  const col = "c1";
  const cards = [
    card("a", col, 0, "bug"),
    card("b", col, 1, "feature"),
    card("x", "c2", 0, "bug"),
  ];

  it("returns column cards sorted by position when no label filter", () => {
    const out = filterCardsForColumn(cards, col, "");
    expect(out.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("restricts to exact label match", () => {
    const out = filterCardsForColumn(cards, col, "bug");
    expect(out.map((c) => c.id)).toEqual(["a"]);
  });

  it("returns empty when no cards match filter", () => {
    expect(filterCardsForColumn(cards, col, "missing").length).toBe(0);
  });

  it("returns empty for empty column", () => {
    expect(filterCardsForColumn(cards, "empty", "").length).toBe(0);
  });
});
