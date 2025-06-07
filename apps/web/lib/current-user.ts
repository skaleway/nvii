import { auth, Session } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";
import { headers } from "next/headers";

export async function getCurrentUserFromDb() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  return session.user;
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
