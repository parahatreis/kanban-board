import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Application user (ownership of boards; auth can be layered on later). */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    index("users_created_at_idx").on(t.createdAt),
  ],
);

/** Kanban board owned by a user. */
export const boards = pgTable(
  "boards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("boards_user_id_idx").on(t.userId),
    index("boards_created_at_idx").on(t.createdAt),
  ],
);

/** Column within a board (ordered by `position`). */
export const columns = pgTable(
  "columns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull(),
  },
  (t) => [
    index("columns_board_id_idx").on(t.boardId),
    index("columns_board_position_idx").on(t.boardId, t.position),
  ],
);

/**
 * Card in a column. `boardId` is denormalized for board-scoped queries (filter/group).
 * `label` supports filter-by-attribute and group-by-attribute in the UI.
 */
export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    columnId: uuid("column_id")
      .notNull()
      .references(() => columns.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    position: integer("position").notNull(),
    label: text("label").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    assigneeUserId: uuid("assignee_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    index("cards_board_id_idx").on(t.boardId),
    index("cards_column_id_idx").on(t.columnId),
    index("cards_column_position_idx").on(t.columnId, t.position),
    index("cards_board_label_idx").on(t.boardId, t.label),
    index("cards_assignee_user_id_idx").on(t.assigneeUserId),
  ],
);
