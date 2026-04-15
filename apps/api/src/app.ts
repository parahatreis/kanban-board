import crypto from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import type { UserRow } from "shared";
import type { Database } from "./db/client.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { apiRoutes } from "./routes/api.js";

export async function buildApp(opts: { db: Database; defaultUser: UserRow }) {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
    genReqId: () => crypto.randomUUID(),
    requestIdHeader: "x-request-id",
    disableRequestLogging: false,
  });
  app.decorate("db", opts.db);
  app.decorate("defaultUser", opts.defaultUser);
  await registerErrorHandler(app);
  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX ?? 600),
    timeWindow: "1 minute",
  });
  await app.register(apiRoutes, { prefix: "/api" });
  return app;
}
