import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { decryptEnv } from "@/lib/actions/decrypt";
import { calculateChanges } from "@nvii/env-helpers";
import { validateCliAuth } from "@/lib/cli-auth";

// Rollback to a version: creates a new current version with the target content
export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string; projectId: string; versionId: string }>;
  }
): Promise<NextResponse> {
  try {
    // read request headers sent from the cli
    const headersList = await headers();
    // validate cli request headers
    const cliUser = await validateCliAuth(headersList);

    // read web request headers
    const webUser = await getCurrentUserFromSession();

    // validate either cli or web request headers
    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { projectId, versionId } = await params;
    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    // Verify user has access to the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          {
            ProjectAccess: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    // The version to roll back to must belong to this project
    const target = await db.envVersion.findFirst({
      where: {
        id: versionId,
        projectId,
      },
    });

    if (!target) {
      return ErrorResponse("Version not found or unauthorized", 404);
    }

    // Diff the target content against the live project content
    const decryptedTarget = await decryptEnv(
      target.content as Record<string, string>,
      project.userId
    );
    const decryptedCurrent = await decryptEnv(
      project.content as Record<string, string>,
      project.userId
    );
    const changes = calculateChanges(decryptedCurrent, decryptedTarget);

    // New version reuses the stored encrypted content, becomes current
    const [version] = await db.$transaction([
      db.envVersion.updateMany({
        where: {
          projectId,
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      }),
      db.envVersion.create({
        data: {
          projectId,
          content: target.content,
          description: `Rollback to version ${target.id.slice(0, 8)}`,
          changes: JSON.parse(JSON.stringify(changes)),
          createdBy: user.id,
          isCurrent: true,
          branch: target.branch,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      db.project.update({
        where: {
          id: projectId,
        },
        data: {
          content: target.content,
        },
      }),
    ]);

    const decryptedContent = await decryptEnv(
      version.content as Record<string, string>,
      project.userId
    );

    return NextResponse.json({
      ...version,
      content: decryptedContent,
    });
  } catch (error) {
    console.error("[VERSION_ROLLBACK]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
