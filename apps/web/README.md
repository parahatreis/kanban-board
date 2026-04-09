# Web (React + Vite)

## Scripts

| Command | Description |
|---------|-------------|
| `yarn workspace web dev` | Vite dev server (default port **5173**) |
| `yarn workspace web build` | `tsc -b` then production bundle |
| `yarn workspace web preview` | Preview production build |
| `yarn workspace web test` | Vitest (pure DnD helpers in [`src/lib/board-dnd.test.ts`](src/lib/board-dnd.test.ts)) |

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives, `cn()` in [`src/lib/utils.ts`](src/lib/utils.ts))
- **React Router** — layout route with **Home** (`/`) and **Board** (`/board/:boardId`)
- **Zustand** ([`src/stores/board-store.ts`](src/stores/board-store.ts)) — boards/columns/cards, filters, **`moveCard`** / **`reorderInColumn`** (aligned with Phase 3 API shapes for Phase 6)
- **React Hook Form** + **Zod** — card create/edit; schemas from **`shared`**
- **@dnd-kit** — drag handle on cards, cross-column move, reorder within column; **`DragOverlay`** preview
- **Vitest** + **happy-dom** — unit tests for [`src/lib/board-dnd.ts`](src/lib/board-dnd.ts)

Path alias: `@/*` → [`src/*`](src).

## Phase 5 — DnD and polish

- **Mock data** only ([`src/mocks/demo-board.ts`](src/mocks/demo-board.ts)); no HTTP client yet (Phase 6).
- **Drag** is enabled only when **no label filter** is active and **group-by** is **None**. Otherwise a hint appears in the filter bar.
- **Grouping by label** uses static lists (drag disabled) to avoid multi-list DnD complexity.
- **Delete** uses a confirmation **AlertDialog**; edit dialog focuses the title field on open.
- **UI polish** takes layout/spacing cues from [Ravenna](https://ravenna.ai/) marketing pages (inspiration only—no brand assets): calmer shell, panel-like columns, lifted drag overlay.

## State shape (rationale)

The store keeps a flat `cards` array plus `columns` for the demo board, with **label filter** and **group-by** driving presentation. **`moveCard`** and **`reorderInColumn`** keep `position` contiguous per column and match the API contract for a future client.
