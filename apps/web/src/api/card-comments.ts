import { apiFetch } from "@/api/client";

export type CardCommentAuthor = {
  id: string;
  displayName: string | null;
  email: string;
};

export type CardCommentDto = {
  id: string;
  cardId: string;
  userId: string;
  body: string;
  createdAt: string;
  author: CardCommentAuthor | null;
};

function parseComment(row: CardCommentDto): CardCommentDto {
  return {
    ...row,
    createdAt:
      typeof row.createdAt === "string" ? row.createdAt : String(row.createdAt),
  };
}

export async function listCardComments(cardId: string): Promise<CardCommentDto[]> {
  const res = await apiFetch<{ comments: CardCommentDto[] }>(
    `/api/cards/${cardId}/comments`,
  );
  return res.comments.map(parseComment);
}

export async function createCardComment(
  cardId: string,
  body: string,
): Promise<{ id: string }> {
  const res = await apiFetch<{ comment: { id: string } }>(
    `/api/cards/${cardId}/comments`,
    { method: "POST", data: { body } },
  );
  return res.comment;
}
