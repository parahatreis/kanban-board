import type { ColumnRow } from "shared";
import { apiFetch } from "@/api/client";

export async function createBoardColumn(
  boardId: string,
  body: { title: string },
): Promise<ColumnRow> {
  return apiFetch<ColumnRow>(`/api/boards/${boardId}/columns`, {
    method: "POST",
    data: body,
  });
}

export async function patchColumn(
  columnId: string,
  patch: { title?: string },
): Promise<ColumnRow> {
  return apiFetch<ColumnRow>(`/api/columns/${columnId}`, {
    method: "PATCH",
    data: patch,
  });
}

export async function reorderBoardColumns(
  boardId: string,
  orderedColumnIds: string[],
): Promise<void> {
  await apiFetch<void>(`/api/boards/${boardId}/columns/reorder`, {
    method: "PATCH",
    data: { orderedColumnIds },
  });
}

export async function deleteColumn(columnId: string): Promise<void> {
  await apiFetch<void>(`/api/columns/${columnId}`, {
    method: "DELETE",
  });
}
