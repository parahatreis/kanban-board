import { relations } from "drizzle-orm";
import { boards, cardComments, cards, columns, users } from "./tables.js";

export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  cardComments: many(cardComments),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  user: one(users, {
    fields: [boards.userId],
    references: [users.id],
  }),
  columns: many(columns),
  cards: many(cards),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  board: one(boards, {
    fields: [cards.boardId],
    references: [boards.id],
  }),
  column: one(columns, {
    fields: [cards.columnId],
    references: [columns.id],
  }),
  assignee: one(users, {
    fields: [cards.assigneeUserId],
    references: [users.id],
  }),
  comments: many(cardComments),
}));

export const cardCommentsRelations = relations(cardComments, ({ one }) => ({
  card: one(cards, {
    fields: [cardComments.cardId],
    references: [cards.id],
  }),
  author: one(users, {
    fields: [cardComments.userId],
    references: [users.id],
  }),
}));
