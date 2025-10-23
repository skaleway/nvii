import { auth } from "@/lib/auth";
import { decryptEnvValues } from "@/lib/encryption";
import { analyzeContent } from "@/lib/objects";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
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
        { userId: session.user.id },
        { ProjectAccess: { some: { userId: session.user.id } } },
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
              image: true,
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
    let decryptedContent = {};
    if (project.content && typeof project.content === "object") {
      decryptedContent = decryptEnvValues(
        project.content as Record<string, string>,
        project.user.id
      );
    }

    return {
      ...project,
      content: analyzeContent(decryptedContent),
    };
  });

  return NextResponse.json(formattedProjects);
}
