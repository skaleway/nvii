import { auth, Session } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";
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
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      headers: {
        cookie: (await headers()).get("cookie") || "",
      },
    },
  );

  if (!session) return null;

  return session.user;
}
