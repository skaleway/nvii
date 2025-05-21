"use server";

import { getCurrentUser } from "@/lib/current-user";
import { tryCatch } from "@/lib/try-catch";
import { db } from "@workspace/db";

import type { Article } from "@workspace/db";

export async function updateArticle({
  spaceId,
  content,
  slug,
}: {
  spaceId: string;
  content: string;
  slug: string;
}): Promise<Article> {
  const { data, error } = await tryCatch(getCurrentUser());

  if (error) throw new Error("Unauthorized");

  const article = await db.article.findUnique({
    where: {
      slug_spaceId: {
        slug,
        spaceId,
      },
    },
  });
  if (!article) throw new Error("Article not found");

  const updated = await db.article.update({
    where: {
      slug_spaceId: {
        slug,
        spaceId,
      },
    },
    data: {
      content,
    },
  });

  return updated;
}

export async function publishArticle({
  spaceId,
  slug,
}: {
  spaceId: string;
  slug: string;
}): Promise<Article> {
  const { data, error } = await tryCatch(getCurrentUser());

  if (error) throw new Error("Unauthorized");

  console.log("publishArticle", spaceId, slug);

  const article = await db.article.findUnique({
    where: {
      slug_spaceId: {
        slug,
        spaceId,
      },
    },
  });
  if (!article) throw new Error("Article not found");

  const updated = await db.article.update({
    where: { slug_spaceId: { slug, spaceId } },
    data: {
      status: article.status === "Draft" ? "Published" : "Draft",
    },
  });

  return updated;
}

export async function deleteArticle({
  spaceId,
  slug,
}: {
  spaceId: string;
  slug: string;
}): Promise<Article> {
  const { data, error } = await tryCatch(getCurrentUser());

  if (error) throw new Error("Unauthorized");

  const article = await db.article.findUnique({
    where: { slug_spaceId: { slug, spaceId } },
  });
  if (!article) throw new Error("Article not found");

  const deleted = await db.article.delete({
    where: { slug_spaceId: { slug, spaceId } },
  });
  return deleted;
}
