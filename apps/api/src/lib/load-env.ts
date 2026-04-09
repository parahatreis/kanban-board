import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root (`kanban-board/`), resolved from `apps/api/src/lib/load-env.ts`. */
const monorepoRoot = path.join(here, "../../../..");

/** Optional overrides in `apps/api/.env` (loaded after root; wins on duplicate keys). */
const apiPackageEnv = path.join(here, "../../../.env");

/**
 * Loads `.env` from the monorepo root, then `apps/api/.env` if present.
 * Use this instead of `import "dotenv/config"` so `DATABASE_URL` works when the
 * process cwd is not the repo root (e.g. IDE task, `cd apps/api && yarn dev`).
 */
export function loadMonorepoEnv(): void {
  config({ path: path.join(monorepoRoot, ".env") });
  config({ path: apiPackageEnv, override: true });
}
