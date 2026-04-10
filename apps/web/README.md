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
- **Zustand** ([`src/stores/board-store.ts`](src/stores/board-store.ts)) — loads boards from the API; **`moveCard`** / **`reorderInColumn`** call the Fastify API
- **API client** — [`src/api/`](src/api/) (**axios** instance, `apiFetch`, `listBoards`, `getBoardDetail`, card/column mutations)
- **React Hook Form** + **Zod** — card create/edit; schemas from **`shared`**
- **@dnd-kit** — drag handle on cards, cross-column move, reorder within column; **`DragOverlay`** preview
- **Vitest** + **happy-dom** — unit tests for [`src/lib/board-dnd.ts`](src/lib/board-dnd.ts) (pure helpers; no HTTP client)

Path alias: `@/*` → [`src/*`](src).

## Phase 6 — API integration

Run the **API** and **web** together (from repo root: `yarn dev`, or two terminals: `yarn workspace api dev` and `yarn workspace web dev`).

1. **Database**: set `DATABASE_URL`, run migrations (`yarn workspace api` scripts — see [`apps/api/README.md`](../api/README.md)), then `seed-db` so boards exist.
2. **API** listens on port **3001** by default (`PORT`).
3. **Browser requests**: in dev, Vite proxies **`/api`** to `http://127.0.0.1:3001` (override port with **`VITE_API_PROXY_PORT`** in `apps/web/.env` if needed).
4. **Direct API URL** (no proxy): set **`VITE_API_BASE_URL`** (e.g. `http://localhost:3001`) so the axios client targets that origin; paths stay `/api/...`.

The home page lists boards from `GET /api/boards`. A board page loads `GET /api/boards/:boardId` and performs card CRUD and drag actions via the documented card/column routes.

## Phase 5 — DnD and polish (still applies)

- **Drag** is enabled only when **no label filter** is active and **group-by** is **None**. Otherwise a hint appears in the filter bar.
- **Grouping by label** uses static lists (drag disabled) to avoid multi-list DnD complexity.
- **Delete** uses a confirmation **AlertDialog**; edit dialog focuses the title field on open.
- **UI polish** takes layout/spacing cues from [Ravenna](https://ravenna.ai/) marketing pages (inspiration only—no brand assets): calmer shell, panel-like columns, lifted drag overlay.

## State shape (rationale)

The store keeps a flat `cards` array plus `columns` for the active board, with **label filter** and **group-by** driving presentation. **`moveCard`** and **`reorderInColumn`** call the API, then refetch the board so positions match the server.
