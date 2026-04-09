import type { Database } from "../db/client.js";
import { getUserByEmail } from "../db/users.js";
import type { UserRow } from "shared";

export function getDefaultUserEmail(): string {
  return process.env.DEFAULT_USER_EMAIL ?? "demo@kanban.local";
}

export async function resolveDefaultUser(db: Database): Promise<UserRow> {
  const email = getDefaultUserEmail();
  const user = await getUserByEmail(db, email);
  if (!user) {
    throw new Error(
      `Default user "${email}" not found. Run: yarn workspace api db:seed`,
    );
  }
  return user;
}
