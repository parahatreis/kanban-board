# API (Fastify)

## HTTP API

Base URL defaults to `http://localhost:3001` (see `PORT` / `HOST`).

Environment variables are loaded from the **monorepo root** `.env` (and optionally `apps/api/.env` for overrides), so `DATABASE_URL` is available even when you run the API or tests with a working directory other than the repo root.

### Single-user scope (Phase 3)

There is no authentication yet. Every request is attributed to a **default user** resolved once at startup:

- Email: `DEFAULT_USER_EMAIL` if set, otherwise **`demo@kanban.local`**
- That user must exist (run `yarn workspace api db:seed`). Board and card operations only apply to boards owned by this user. Accessing another user’s board or a non-existent id returns **404** (`BOARD_NOT_FOUND`, `CARD_NOT_FOUND`, etc.).

### Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness; includes shared package version |
| GET | `/api/boards` | List boards for the default user |
| GET | `/api/boards/:boardId` | Board, columns, and cards (one payload for the Kanban UI) |
| GET | `/api/users` | List users (`id`, `email`, `displayName`, `createdAt`) — for assignee picker |
| POST | `/api/boards/:boardId/columns` | Create column (`title`); position appended |
| PATCH | `/api/boards/:boardId/columns/reorder` | Body `{ "orderedColumnIds": ["uuid", ...] }` — full column order for the board |
| GET | `/api/boards/:boardId/cards` | List cards; optional query `label`, `search` (substring on title/description) |
| POST | `/api/cards` | Create card (`boardId`, `columnId`, `title`, `description?`, `position`, `label?`, `assigneeUserId?`) |
| GET | `/api/cards/:cardId` | Get one card |
| PATCH | `/api/cards/:cardId` | Update fields (`title`, `description`, `label`, `position`, `columnId`, `assigneeUserId` set to `null` to clear; not for moving boards) |
| PATCH | `/api/cards/:cardId/move` | Move card (`columnId`, `position`) |
| DELETE | `/api/cards/:cardId` | Delete card |
| PATCH | `/api/columns/:columnId` | Update column (`title`) |
| DELETE | `/api/columns/:columnId` | Delete column (cascades cards in that column) |
| PATCH | `/api/columns/:columnId/reorder` | Body `{ "orderedCardIds": ["uuid", ...] }` — positions 0..n-1 |

Validation errors return **400** with `{ "error": { "message": "Invalid request", "issues": … } }`. Application errors use `{ "error": { "message": "…", "code": "…" } }` when a code is set.

### Example `curl`

```bash
# List boards (after seed)
curl -s http://localhost:3001/api/boards | jq .

# Board detail with columns and cards
curl -s http://localhost:3001/api/boards/<board-uuid> | jq .

# Create a card (use ids from the board detail response)
curl -s -X POST http://localhost:3001/api/cards \
  -H 'Content-Type: application/json' \
  -d '{"boardId":"...","columnId":"...","title":"New task","position":0}'
```

### Tests

- `yarn workspace api test` — always runs **validation** tests (no DB).
- Set **`DATABASE_URL`** or **`DATABASE_URL_TEST`** to also run **integration** tests against Postgres (seeded DB recommended).

## Database

The Drizzle schema includes **`users`** (unique `email`, optional `display_name`) and **`boards`** with **`user_id`** referencing `users` (board ownership). **`cards`** include **`created_at`** (default now) and optional **`assignee_user_id`** referencing **`users`** (`ON DELETE SET NULL`). After changing schema, regenerate and apply migrations before running the seed script.

1. Set `DATABASE_URL` in the repo root `.env` (see `.env.example`).
2. Generate SQL from the shared Drizzle schema: `yarn workspace api db:generate`
3. Apply migrations: `yarn workspace api db:migrate`
4. Optional: `yarn workspace api db:studio` to inspect the database.

After migrations, seed persistent **demo** data (user `demo@kanban.local`, extra team users for assignees, boards “Demo board” and “Second board” with sample columns/cards). Safe to run twice: it only creates users/boards that are missing.

```bash
yarn workspace api db:seed
```

The seed script requires a migrated database; it is not part of `yarn build`.
