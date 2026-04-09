import { describe, expect, it } from "vitest";
import type { CardRow } from "shared";
import { applyMove, applyReorderInColumn } from "./board-dnd.js";

function card(
  id: string,
  columnId: string,
  position: number,
  label = "",
): CardRow {
  return {
    id,
    boardId: "b1",
    columnId,
    title: id,
    description: "",
    position,
    label,
  };
}

describe("applyReorderInColumn", () => {
  it("reassigns positions by id order", () => {
    const cards = [
      card("a", "c1", 0),
      card("b", "c1", 1),
      card("x", "c2", 0),
    ];
    const next = applyReorderInColumn(cards, "c1", ["b", "a"]);
    expect(next.find((c) => c.id === "b")!.position).toBe(0);
    expect(next.find((c) => c.id === "a")!.position).toBe(1);
    expect(next.find((c) => c.id === "x")!.position).toBe(0);
  });

  it("returns unchanged when id set mismatches column", () => {
    const cards = [card("a", "c1", 0), card("b", "c1", 1)];
    expect(applyReorderInColumn(cards, "c1", ["a"])).toEqual(cards);
  });
});

describe("applyMove", () => {
  it("moves to another column at index 0", () => {
    const cards = [card("a", "c1", 0), card("b", "c1", 1)];
    const next = applyMove(cards, "b", "c2", 0);
    expect(next.find((c) => c.id === "b")!.columnId).toBe("c2");
    expect(next.find((c) => c.id === "b")!.position).toBe(0);
    expect(next.find((c) => c.id === "a")!.position).toBe(0);
  });

  it("reorders within the same column", () => {
    const cards = [
      card("a", "c1", 0),
      card("b", "c1", 1),
      card("c", "c1", 2),
    ];
    const next = applyMove(cards, "c", "c1", 0);
    expect(next.filter((x) => x.columnId === "c1").sort((x, y) => x.position - y.position).map((x) => x.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("returns unchanged for unknown card id", () => {
    const cards = [card("a", "c1", 0)];
    expect(applyMove(cards, "nope", "c2", 0)).toEqual(cards);
  });
});
