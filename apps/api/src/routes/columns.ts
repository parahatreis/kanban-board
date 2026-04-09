import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import * as cardsService from "../services/cards.js";
import { reorderColumnBodySchema } from "../schemas/http.js";

const columnIdParams = z.object({ columnId: z.string().uuid() });

export const columnRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.patch("/columns/:columnId/reorder", async (request, reply) => {
    const params = columnIdParams.parse(request.params);
    const body = reorderColumnBodySchema.parse(request.body);
    await cardsService.reorderColumnForUser(
      fastify.db,
      fastify.defaultUser.id,
      params.columnId,
      body.orderedCardIds,
    );
    return reply.status(204).send();
  });
};
