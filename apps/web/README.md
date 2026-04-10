# Web (React + Vite)

Overview for reviewers: see the **[root README](../README.md)** for monorepo setup, architecture, database, API summary, and trade-offs.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn workspace web dev` | Vite dev server (default port **5173**) |
| `yarn workspace web build` | `tsc -b` then production bundle |
| `yarn workspace web preview` | Preview production build |
| `yarn workspace web test` | Vitest — [`src/lib/board-dnd.test.ts`](src/lib/board-dnd.test.ts), [`src/lib/board-view.test.ts`](src/lib/board-view.test.ts) |

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives, `cn()` in [`src/lib/utils.ts`](src/lib/utils.ts))
- **React Router** — layout route with **Home** (`/`) and **Board** (`/board/:boardId`)
- **Zustand** ([`src/stores/board-store.ts`](src/stores/board-store.ts)) — active board state; mutations call the Fastify API then **merge** responses when safe (see root README)
- **API client** — [`src/api/`](src/api/) (**axios** instance, `apiFetch`, `listBoards`, `getBoardDetail`, card/column mutations)
- **React Hook Form** + **Zod** — card create; edit uses same schemas in the card details dialog; schemas from **`shared`**
- **@dnd-kit** — drag handle on cards, cross-column move, reorder within column; **`DragOverlay`** preview
- **Vitest** + **happy-dom** — pure helpers (`board-dnd`, `board-view`) without HTTP

Path alias: `@/*` → [`src/*`](src).

## Phase 6 — API integration

Run the **API** and **web** together (from repo root: `yarn dev`, or two terminals: `yarn workspace api dev` and `yarn workspace web dev`).

1. **Database**: set `DATABASE_URL`, run migrations (`yarn workspace api` scripts — see [`apps/api/README.md`](../api/README.md)), then `seed-db` so boards exist.
2. **API** listens on port **3001** by default (`PORT`).
3. **Browser requests**: in dev, Vite proxies **`/api`** to `http://127.0.0.1:3001` (override port with **`VITE_API_PROXY_PORT`** in `apps/web/.env` if needed).
4. **Direct API URL** (no proxy): set **`VITE_API_BASE_URL`** (e.g. `http://localhost:3001`) so the axios client targets that origin; paths stay `/api/...`.

The home page lists boards from `GET /api/boards`. A board page loads `GET /api/boards/:boardId` and performs card CRUD and drag actions via the documented card/column routes.

## Phase 7 (optional) — boards discovery, details, search, responsiveness

- **Home (`/`)** — boards appear as a **responsive grid of large cards** (not a table); each links to `/board/:id`.
- **Sidebar** — under **Boards**, every board from the API is listed for quick navigation; collapsed desktop mode shows initials with `title` tooltips.
- **Card details** — clicking a card opens a **dialog** with editable title/description, label, assignee, **comments** (`GET`/`POST` `/api/cards/:id/comments`), save, and delete. Markdown rendering is intentionally out of scope.
- **Toolbar search** — debounced query drives `GET /api/boards/:boardId?search=…` via `boardSearchQuery` in the board store (label filter stays client-side on the loaded card set).
- **Mobile** — horizontal column strip uses **smooth scrolling**; search field uses a **taller touch target** on small screens. Further virtualization for huge columns is deferred (see API README).

Shared boards directory state: [`src/stores/boards-directory-store.ts`](src/stores/boards-directory-store.ts).

## Filters and DnD

- **Filter by label** — dropdown limits visible cards to one label (exact match); other cards are hidden.
- **Group by label** — optional second control; keeps the same filtered set but **reorganizes** each column into labeled sections (alphabetical; **No label** last). This is layout grouping, not an additional filter.
- **Drag-and-drop** is enabled only when **no label filter** and **no label grouping**; otherwise a hint appears in the filter bar.

Helpers: [`src/lib/board-view.ts`](src/lib/board-view.ts) (`filterCardsForColumn`, `groupCardsByLabelForColumn`).

## Phase 5 — polish

- **Delete** uses a confirmation **AlertDialog** where applicable.
- **UI polish** takes layout/spacing cues from [Ravenna](https://ravenna.ai/) marketing pages (inspiration only—no brand assets): calmer shell, panel-like columns, lifted drag overlay.

## State shape (rationale)

The store keeps a flat `cards` array plus `columns` for the active board. **`labelFilter`**, **`groupBy`**, and **`boardSearchQuery`** drive what appears and how columns are laid out. **`groupBy`** resets to `none` on a full (non-silent) board load and on load errors. After most mutations, the store **merges** API responses; **silent `loadBoard`** runs when server-side search is active or after **`moveCard`** so sibling positions stay consistent with the server.
