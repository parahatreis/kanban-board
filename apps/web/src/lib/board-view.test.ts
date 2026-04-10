import { describe, expect, it } from "vitest";
import type { CardRow } from "shared";
import {
  EMPTY_LABEL_KEY,
  filterCardsForColumn,
  groupCardsByLabelForColumn,
} from "./board-view.js";

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

describe("groupCardsByLabelForColumn", () => {
  const col = "c1";

  it("buckets by trimmed label and sorts groups alphabetically with No label last", () => {
    const cards = [
      card("a", col, 0, "zebra"),
      card("b", col, 1, "  alpha  "),
      card("c", col, 2, ""),
      card("d", col, 3, "   "),
    ];
    const groups = groupCardsByLabelForColumn(cards, col, "");
    expect(groups.map((g) => g.labelKey)).toEqual(["alpha", "zebra", EMPTY_LABEL_KEY]);
    expect(groups[0]!.cards.map((c) => c.id)).toEqual(["b"]);
    expect(groups[1]!.cards.map((c) => c.id)).toEqual(["a"]);
    expect(groups[2]!.cards.map((c) => c.id)).toEqual(["c", "d"]);
    expect(groups[2]!.displayLabel).toBe("No label");
  });

  it("applies label filter before grouping", () => {
    const cards = [
      card("a", col, 0, "bug"),
      card("b", col, 1, "feature"),
    ];
    const groups = groupCardsByLabelForColumn(cards, col, "bug");
    expect(groups.length).toBe(1);
    expect(groups[0]!.labelKey).toBe("bug");
    expect(groups[0]!.cards.map((c) => c.id)).toEqual(["a"]);
  });

  it("sorts cards within a group by position", () => {
    const cards = [
      card("second", col, 1, "bug"),
      card("first", col, 0, "bug"),
    ];
    const groups = groupCardsByLabelForColumn(cards, col, "");
    expect(groups[0]!.cards.map((c) => c.id)).toEqual(["first", "second"]);
  });
});
