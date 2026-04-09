import { drizzle } from "drizzle-orm/node-postgres";
import { drizzleSchema } from "shared";
import pg from "pg";

export type Database = ReturnType<typeof createDb>;

export function createPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString });
}

export function createDb(pool: pg.Pool) {
  return drizzle(pool, { schema: drizzleSchema });
}
