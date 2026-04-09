import { eq } from "drizzle-orm";
import { users } from "shared";
import type { Database } from "./client.js";

export async function insertUser(
  db: Database,
  values: { email: string; displayName?: string | null },
) {
  const [row] = await db.insert(users).values(values).returning();
  return row;
}

export async function getUserById(db: Database, id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getUserByEmail(db: Database, email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function listUsers(db: Database) {
  return db.query.users.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)],
  });
}

export async function updateUser(
  db: Database,
  id: string,
  values: { email?: string; displayName?: string | null },
) {
  const [row] = await db
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning();
  return row;
}

export async function deleteUser(db: Database, id: string) {
  const [row] = await db.delete(users).where(eq(users.id, id)).returning();
  return row;
}
