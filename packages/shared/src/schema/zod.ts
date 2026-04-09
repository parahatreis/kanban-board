import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { boards, cards, columns, users } from "./tables.js";

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

export const boardSelectSchema = createSelectSchema(boards);
export const boardInsertSchema = createInsertSchema(boards);

export const columnSelectSchema = createSelectSchema(columns);
export const columnInsertSchema = createInsertSchema(columns);

export const cardSelectSchema = createSelectSchema(cards);
export const cardInsertSchema = createInsertSchema(cards);

/** Partial updates for cards (e.g. move / reorder). */
export const cardPatchSchema = cardInsertSchema
  .partial()
  .required({ id: true });

export type UserRow = z.infer<typeof userSelectSchema>;
export type BoardRow = z.infer<typeof boardSelectSchema>;
export type ColumnRow = z.infer<typeof columnSelectSchema>;
export type CardRow = z.infer<typeof cardSelectSchema>;

export type UserInsert = z.infer<typeof userInsertSchema>;
export type BoardInsert = z.infer<typeof boardInsertSchema>;
export type ColumnInsert = z.infer<typeof columnInsertSchema>;
export type CardInsert = z.infer<typeof cardInsertSchema>;

/** Create-card form (aligned with API body; position is assigned server-side / in store). */
export const cardCreateFormSchema = z.object({
  boardId: z.string().uuid(),
  columnId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  label: z.string().optional(),
});

/** Edit-card form fields (subset of patch). */
export const cardEditFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  label: z.string().optional(),
});

export type CardCreateForm = z.infer<typeof cardCreateFormSchema>;
export type CardEditForm = z.infer<typeof cardEditFormSchema>;
