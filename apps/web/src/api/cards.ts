import type { CardRow } from "shared";
import { apiFetch } from "@/api/client";
import { normalizeCard } from "@/api/parse";

export async function createCard(body: {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  position: number;
  label?: string;
  assigneeUserId?: string;
}): Promise<CardRow> {
  const row = await apiFetch<CardRow>("/api/cards", {
    method: "POST",
    data: body,
  });
  return normalizeCard(row);
}

export async function patchCard(
  cardId: string,
  patch: {
    title?: string;
    description?: string;
    label?: string;
    assigneeUserId?: string | null;
  },
): Promise<CardRow> {
  const row = await apiFetch<CardRow>(`/api/cards/${cardId}`, {
    method: "PATCH",
    data: patch,
  });
  return normalizeCard(row);
}

export async function moveCard(
  cardId: string,
  body: { columnId: string; position: number },
): Promise<CardRow> {
  const row = await apiFetch<CardRow>(`/api/cards/${cardId}/move`, {
    method: "PATCH",
    data: body,
  });
  return normalizeCard(row);
}

export async function deleteCard(cardId: string): Promise<void> {
  await apiFetch<void>(`/api/cards/${cardId}`, {
    method: "DELETE",
  });
}

export async function reorderColumn(
  columnId: string,
  orderedCardIds: string[],
): Promise<void> {
  await apiFetch<void>(`/api/columns/${columnId}/reorder`, {
    method: "PATCH",
    data: { orderedCardIds },
  });
}
