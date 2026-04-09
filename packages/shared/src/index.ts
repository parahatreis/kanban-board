import { z } from "zod";

/** Placeholder schema; real board/card schemas in later phases. */
export const placeholderSchema = z.object({ ok: z.literal(true) });

export const SHARED_VERSION = "0.0.0" as const;
