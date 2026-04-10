<img width="2042" height="1060" alt="Screenshot 2026-04-09 at 19 06 09" src="https://github.com/user-attachments/assets/a227214c-0c40-4a51-873b-de49350316da" />

# Kanban board

Monorepo: **React + Vite** frontend and **Fastify** REST API with **PostgreSQL**, built for the Ravenna-style Kanban challenge (CRUD, DnD, filters, search, comments).

## Prerequisites

- **Node.js** (LTS recommended)
- **Yarn** — version pinned in [`package.json`](package.json) (`packageManager` field)
- **PostgreSQL** — connection string for Drizzle migrations and the API

## Quick start

1. Clone the repo and install dependencies:

   ```bash
   yarn install
   ```

2. Environment: copy [`.env.example`](.env.example) to `.env` at the **repo root** and set `DATABASE_URL` for your Postgres instance.

3. Database:

   ```bash
   yarn workspace api db:migrate
   yarn workspace api db:seed
   ```

4. Run **API + web** together:

   ```bash
   yarn dev
   ```

   - Web: [http://localhost:5173](http://localhost:5173) (Vite proxies `/api` to the API by default)
   - API: port **3001** unless `PORT` is set — see [apps/api/README.md](apps/api/README.md)

For script-level detail (build, tests, DB studio), use the app READMEs below.

## Repository layout

| Path | Role |
|------|------|
| [apps/web/](apps/web/) | React UI, Zustand stores, `@dnd-kit` board |
| [apps/api/](apps/api/) | Fastify HTTP API, Drizzle + Postgres |
| [packages/shared/](packages/shared/) | Shared Drizzle schema, Zod types, package `shared` |

## Architecture (short)

- **Browser** loads the SPA, calls `/api/...` (proxied in dev or via `VITE_API_BASE_URL`).
- **API** validates with Zod, uses a single default user (no auth) for board ownership; returns JSON errors in a consistent shape.
- **Database** holds users, boards, columns, cards (with optional soft-delete and comments). Schema lives in `packages/shared` and migrations in `apps/api/drizzle/`.

## State management

**Zustand** is used for:

- **`board-store`** — active board: `columns`, `cards`, toolbar **label filter**, debounced **search** query, assignee **users** list. Mutations call the API, then **merge** returned rows into state when possible; **full silent reload** is used when server-side search is active or after **cross-column move** so positions stay consistent.
- **`boards-directory-store`** — list of boards for home + sidebar.

Zustand keeps server state in plain objects, avoids Redux boilerplate for this scope, and works cleanly with React hooks and `@dnd-kit`.

## Database

Postgres + **Drizzle ORM**. Apply migrations before seeding. Commands and schema notes: [apps/api/README.md](apps/api/README.md#database).

## API summary

- `GET /api/boards` — list boards
- `GET /api/boards/:id` — board + columns + cards (optional `search`, `label` query)
- Card CRUD, move, reorder column cards, column CRUD/reorder
- Comments on cards; soft delete on cards

Full route table and examples: [apps/api/README.md](apps/api/README.md#http-api).

## UX / product behavior

- **Columns & cards** — create, edit, delete; drag to reorder within a column or move across columns (when DnD is enabled).
- **Filter by label** — toolbar dropdown restricts visible cards to one label (client-side on loaded cards). Drag-and-drop is disabled while a label filter is active.
- **Search** — debounced server-side filter on title/description.
- **Card details** — single dialog for description, comments, metadata, save, delete.

## Trade-offs & future work

- **DnD off** when a label filter is active — avoids reordering a partially visible list; acceptable for a small take-home scope.
- **Large boards** — full-board payloads; virtualization or pagination would be next steps.
- **Auth** — single default user by design (challenge assumption).

## Testing

```bash
yarn workspace web test    # Vitest: board DnD + board-view helpers
yarn workspace api test    # Validation always; integration tests if DATABASE_URL / DATABASE_URL_TEST is set
```

## Documentation index

- [apps/web/README.md](apps/web/README.md) — frontend stack, scripts, feature phases
- [apps/api/README.md](apps/api/README.md) — HTTP API, env, DB, tests

## License

Private / project use unless otherwise stated.
