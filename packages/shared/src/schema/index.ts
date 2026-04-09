export * from "./tables.js";
export * from "./relations.js";
export * from "./zod.js";

import * as tables from "./tables.js";
import * as relations from "./relations.js";

/** Pass to `drizzle(pool, { schema })` for relational queries. */
export const drizzleSchema = {
  ...tables,
  ...relations,
} as const;
