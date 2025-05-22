"use server";

import { tryCatch } from "@/lib/try-catch";
import { getCurrentUser } from "@/lib/current-user";
import { FormValues } from "@/components/forms/keys-form";
import { db } from "@workspace/db";

export async function updateSpace(data: FormValues, spaceId: string) {
  const { data: _, error } = await tryCatch(getCurrentUser());

  if (error) throw new Error("Unauthorized");

  const space = await db.space.update({
    where: { id: spaceId },
    data: {
      ghFinedGrainedToken: data.githubToken,
      ghRepository: data.githubRepo,
      ghUsername: data.githubUsername,
    },
  });

  return space;
}
