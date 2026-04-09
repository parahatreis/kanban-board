import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import * as cardsService from "../services/cards.js";
import {
  createCardBodySchema,
  listCardsQuerySchema,
  moveCardBodySchema,
  patchCardBodySchema,
} from "../schemas/http.js";

const boardIdParams = z.object({ boardId: z.string().uuid() });
const cardIdParams = z.object({ cardId: z.string().uuid() });

export const cardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/boards/:boardId/cards", async (request) => {
    const params = boardIdParams.parse(request.params);
    const query = listCardsQuerySchema.parse(request.query);
    const cards = await cardsService.listCardsForBoard(
      fastify.db,
      params.boardId,
      fastify.defaultUser.id,
      query,
    );
    return { cards };
  });

  fastify.post("/cards", async (request, reply) => {
    const body = createCardBodySchema.parse(request.body);
    const card = await cardsService.createCard(
      fastify.db,
      fastify.defaultUser.id,
      body,
    );
    return reply.status(201).send(card);
  });

  fastify.get("/cards/:cardId", async (request) => {
    const params = cardIdParams.parse(request.params);
    return cardsService.assertCardOwnedByUser(
      fastify.db,
      params.cardId,
      fastify.defaultUser.id,
    );
  });

  fastify.patch("/cards/:cardId/move", async (request) => {
    const params = cardIdParams.parse(request.params);
    const body = moveCardBodySchema.parse(request.body);
    return cardsService.moveCardForUser(
      fastify.db,
      fastify.defaultUser.id,
      params.cardId,
      body,
    );
  });

  fastify.patch("/cards/:cardId", async (request) => {
    const params = cardIdParams.parse(request.params);
    const body = patchCardBodySchema.parse(request.body);
    return cardsService.updateCard(
      fastify.db,
      fastify.defaultUser.id,
      params.cardId,
      body,
    );
  });

  fastify.delete("/cards/:cardId", async (request, reply) => {
    const params = cardIdParams.parse(request.params);
    await cardsService.deleteCardForUser(
      fastify.db,
      fastify.defaultUser.id,
      params.cardId,
    );
    return reply.status(204).send();
  });
};
