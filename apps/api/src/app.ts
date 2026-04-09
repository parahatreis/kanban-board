import Fastify from "fastify";
import type { UserRow } from "shared";
import type { Database } from "./db/client.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { apiRoutes } from "./routes/api.js";

export async function buildApp(opts: { db: Database; defaultUser: UserRow }) {
  const app = Fastify({ logger: true });
  app.decorate("db", opts.db);
  app.decorate("defaultUser", opts.defaultUser);
  await registerErrorHandler(app);
  await app.register(apiRoutes, { prefix: "/api" });
  return app;
}
