import { auth } from "@/lib/auth";
import { decryptEnvValues } from "@/lib/encryption";
import { analyzeContent } from "@/lib/objects";
import { ErrorResponse } from "@/lib/response";
import { db } from "@workspace/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return ErrorResponse("Unauthorized", 401);
  }

  if (!session) {
    return ErrorResponse("Unauthorized", 401);
  }

  const projects = await db.project.findMany({
    where: {
      OR: [
        { userId: session.user.id }, // Projects owned by the user
        { ProjectAccess: { some: { userId: session.user.id } } }, // Projects shared with the user
      ],
    },
    include: {
      ProjectAccess: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProjects = projects.map((project) => {
    // First decrypt the content if it exists
    let decryptedContent = {};
    if (project.content && typeof project.content === "object") {
      // Use the project owner's ID for decryption
      decryptedContent = decryptEnvValues(
        project.content as Record<string, string>,
        session.user.id, // This is the project owner's ID
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
