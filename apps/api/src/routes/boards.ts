import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import * as boardsService from "../services/boards.js";

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
};
