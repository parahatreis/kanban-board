import { z } from "zod";

export const uuidParamSchema = z.string().uuid();

export const listCardsQuerySchema = z.object({
  label: z.string().optional(),
  search: z.string().optional(),
});

/** Same filters as list cards — for GET /boards/:boardId full detail. */
export const boardDetailQuerySchema = z.object({
  label: z.string().optional(),
  search: z.string().optional(),
});

export const createCardBodySchema = z.object({
  boardId: z.string().uuid(),
  columnId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.coerce.number().int().min(0),
  label: z.string().optional(),
  assigneeUserId: z.string().uuid().optional(),
});

export const patchCardBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    label: z.string().optional(),
    position: z.coerce.number().int().min(0).optional(),
    columnId: z.string().uuid().optional(),
    boardId: z.string().uuid().optional(),
    assigneeUserId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const moveCardBodySchema = z.object({
  columnId: z.string().uuid(),
  position: z.coerce.number().int().min(0),
});

export const reorderColumnBodySchema = z.object({
  orderedCardIds: z.array(z.string().uuid()).min(1),
});

export const createColumnBodySchema = z.object({
  title: z.string().min(1),
});

export const patchColumnBodySchema = z.object({
  title: z.string().min(1),
});

export const reorderBoardColumnsBodySchema = z.object({
  orderedColumnIds: z.array(z.string().uuid()).min(1),
});

export const createBoardBodySchema = z.object({
  name: z.string().min(1),
});

export const createCardCommentBodySchema = z.object({
  body: z.string().min(1).max(8000),
});
