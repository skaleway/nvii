import { getClerkUser } from "@/lib/current-user";
import { auth } from "@clerk/nextjs/server";
import { db } from "@workspace/db";
import { redirect } from "next/navigation";

export default async function CreateUser() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  const userInDb = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (userInDb) {
    redirect("/");
  }
  const clerkUser = await getClerkUser(userId);

  if (!clerkUser) {
    redirect("/auth/sign-in");
  }

  await db.user.create({
    data: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.firstName || "",
    },
  });

  redirect("/");
}
