# API (Fastify)

## Database

The Drizzle schema includes **`users`** (unique `email`, optional `display_name`) and **`boards`** with **`user_id`** referencing `users` (board ownership). Columns and cards are unchanged from the Kanban model. After changing schema, regenerate and apply migrations before running the seed script.

1. Set `DATABASE_URL` in the repo root `.env` (see `.env.example`).
2. Generate SQL from the shared Drizzle schema: `yarn workspace api db:generate`
3. Apply migrations: `yarn workspace api db:migrate`
4. Optional: `yarn workspace api db:studio` to inspect the database.

After migrations, seed persistent **demo** data (user `demo@kanban.local`, board “Demo board”, sample columns and cards). Safe to run twice: it skips if that board already exists.

```bash
yarn workspace api db:seed
```

The seed script requires a migrated database; it is not part of `yarn build`.
