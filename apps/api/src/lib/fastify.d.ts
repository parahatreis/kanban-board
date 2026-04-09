import type { Database } from "../db/client.js";
import type { UserRow } from "shared";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    defaultUser: UserRow;
  }
}
