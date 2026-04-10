import type { Database } from "../db/client.js";
import * as dbUsers from "../db/users.js";

export async function listUsersForApp(db: Database) {
  return dbUsers.listUsers(db);
}
