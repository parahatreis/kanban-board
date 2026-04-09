import type { FastifyPluginAsync } from "fastify";
import { SHARED_VERSION } from "shared";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
    shared: SHARED_VERSION,
  }));
};
