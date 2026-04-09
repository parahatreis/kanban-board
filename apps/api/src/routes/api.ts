import type { FastifyPluginAsync } from "fastify";
import { boardRoutes } from "./boards.js";
import { cardRoutes } from "./cards.js";
import { columnRoutes } from "./columns.js";
import { healthRoutes } from "./health.js";

/** All HTTP routes for the app, mounted at `/api` in `app.ts`. */
export const apiRoutes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(boardRoutes);
  await app.register(cardRoutes);
  await app.register(columnRoutes);
};
