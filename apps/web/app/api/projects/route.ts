import { getClerkUser } from "@/lib/current-user";
import { decryptEnvValues } from "@/lib/encryption";
import { analyzeContent } from "@/lib/objects";
import { ErrorResponse } from "@/lib/response";
import { auth } from "@clerk/nextjs/server";
import { db } from "@workspace/db";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return ErrorResponse("Unauthorized", 401);
  }

  const user = await getClerkUser(userId);

  if (!user) {
    return ErrorResponse("Unauthorized", 401);
  }

  const projects = await db.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProjects = projects.map((project) => {
    // First decrypt the content if it exists
    let decryptedContent = {};
    if (project.content && typeof project.content === "object") {
      decryptedContent = decryptEnvValues(
        project.content as Record<string, string>,
        user.id
      );
    }

    // Then analyze the decrypted content
    return {
      ...project,
      content: analyzeContent(decryptedContent),
    };
  });

  return NextResponse.json(formattedProjects);
}
