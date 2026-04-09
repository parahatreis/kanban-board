# Web (React + Vite)

## Scripts

| Command | Description |
|---------|-------------|
| `yarn workspace web dev` | Vite dev server (default port **5173**) |
| `yarn workspace web build` | `tsc -b` then production bundle |
| `yarn workspace web preview` | Preview production build |

## Stack (Phase 4)

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives, `cn()` in [`src/lib/utils.ts`](src/lib/utils.ts))
- **React Router** — layout route with **Home** (`/`) and **Board** (`/board/:boardId`)
- **Zustand** ([`src/stores/board-store.ts`](src/stores/board-store.ts)) — boards/columns/cards and filter/group UI state; mock-only until Phase 6 API wiring
- **React Hook Form** + **Zod** — card create/edit dialogs; schemas from **`shared`** (`cardCreateFormSchema`, `cardEditFormSchema`)

Path alias: `@/*` → [`src/*`](src).

## Phase 4 scope

- **Mock data** in [`src/mocks/demo-board.ts`](src/mocks/demo-board.ts); no HTTP client yet.
- **No drag-and-drop** (Phase 5). Cards are edited via click → dialog.

## State shape (rationale)

The store keeps a flat `cards` array plus `columns` for the active demo board, with **label filter** and **group-by label** flags driving presentation only. This mirrors the future API model (board-scoped cards with `columnId`, `position`, `label`) and keeps optimistic updates straightforward in Phase 6.
