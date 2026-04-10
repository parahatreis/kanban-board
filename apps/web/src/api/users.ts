import type { UserRow } from "shared";
import { apiFetch } from "@/api/client";
import { normalizeUser } from "@/api/parse";

export async function listUsers(): Promise<UserRow[]> {
  const res = await apiFetch<{ users: UserRow[] }>("/api/users");
  return res.users.map((u) => normalizeUser(u));
}
