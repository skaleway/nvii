// import { auth } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@workspace/db";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) return null;

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

export async function getClerkUser(userId: string) {
  const user = await clerkClient().then((client) =>
    client.users.getUser(userId),
  );

  if (!user) return null;

  return user;
}
