import type { FastifyPluginAsync } from "fastify";
import * as usersService from "../services/users.js";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/users", async () => {
    const users = await usersService.listUsersForApp(fastify.db);
    return { users };
  });
};
