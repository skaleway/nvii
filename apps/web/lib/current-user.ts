"use server";

import { auth } from "@/lib/auth";
import { db } from "@nvii/db";
import { headers } from "next/headers";

export async function getCurrentUserFromDb() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) return null;

  return user;
}

export async function getCurrentUserFromSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  return session.user;
}
