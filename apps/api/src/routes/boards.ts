import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  createColumnBodySchema,
  reorderBoardColumnsBodySchema,
} from "../schemas/http.js";
import * as boardsService from "../services/boards.js";
import * as columnsService from "../services/columns.js";

const boardIdParams = z.object({ boardId: z.string().uuid() });

export const boardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/boards", async () => {
    const boards = await boardsService.listBoardsForUser(
      fastify.db,
      fastify.defaultUser.id,
    );
    return { boards };
  });

  fastify.get("/boards/:boardId", async (request) => {
    const params = boardIdParams.parse(request.params);
    return boardsService.getBoardDetail(
      fastify.db,
      params.boardId,
      fastify.defaultUser.id,
    );
  });

  fastify.post("/boards/:boardId/columns", async (request, reply) => {
    const params = boardIdParams.parse(request.params);
    const body = createColumnBodySchema.parse(request.body);
    const column = await columnsService.createColumnForUser(
      fastify.db,
      fastify.defaultUser.id,
      params.boardId,
      body,
    );
    return reply.status(201).send(column);
  });

  fastify.patch("/boards/:boardId/columns/reorder", async (request, reply) => {
    const params = boardIdParams.parse(request.params);
    const body = reorderBoardColumnsBodySchema.parse(request.body);
    await columnsService.reorderBoardColumnsForUser(
      fastify.db,
      fastify.defaultUser.id,
      params.boardId,
      body.orderedColumnIds,
    );
    return reply.status(204).send();
  });
};
