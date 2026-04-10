import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import * as cardsService from "../services/cards.js";
import * as columnsService from "../services/columns.js";
import {
  patchColumnBodySchema,
  reorderColumnBodySchema,
} from "../schemas/http.js";

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

  fastify.patch("/columns/:columnId", async (request) => {
    const params = columnIdParams.parse(request.params);
    const body = patchColumnBodySchema.parse(request.body);
    return columnsService.updateColumnForUser(
      fastify.db,
      fastify.defaultUser.id,
      params.columnId,
      body,
    );
  });

  fastify.delete("/columns/:columnId", async (request, reply) => {
    const params = columnIdParams.parse(request.params);
    await columnsService.deleteColumnForUser(
      fastify.db,
      fastify.defaultUser.id,
      params.columnId,
    );
    return reply.status(204).send();
  });
};
