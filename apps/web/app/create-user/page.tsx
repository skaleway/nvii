import { auth } from "@/lib/auth";
import { db } from "@workspace/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CreateUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const userInDb = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (userInDb) {
    redirect("/");
  }

  redirect("/");
}
