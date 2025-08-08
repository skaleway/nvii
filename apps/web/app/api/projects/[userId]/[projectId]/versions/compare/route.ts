import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateCliAuth } from "../../../route";
import { decryptEnv } from "@/lib/actions/decrypt";

// Compare two versions
export async function POST(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const { userId, projectId } = await params;

    // Authentication
    const headersList = await headers();
    const cliUser = await validateCliAuth(headersList);
    const webUser = await getCurrentUserFromSession();

    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { leftVersionId, rightVersionId } = body;

    if (!leftVersionId || !rightVersionId) {
      return ErrorResponse("Both version IDs are required", 400);
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

    // Get both versions
    const [leftVersion, rightVersion] = await Promise.all([
      db.envVersion.findFirst({
        where: {
          id: leftVersionId,
          projectId,
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
      db.envVersion.findFirst({
        where: {
          id: rightVersionId,
          projectId,
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
    ]);

    if (!leftVersion || !rightVersion) {
      return ErrorResponse("One or both versions not found", 404);
    }

    // Decrypt both versions
    const [leftDecrypted, rightDecrypted] = await Promise.all([
      decryptEnv(leftVersion.content as Record<string, string>, project.userId),
      decryptEnv(
        rightVersion.content as Record<string, string>,
        project.userId,
      ),
    ]);

    // Calculate diff
    const allKeys = new Set([
      ...Object.keys(leftDecrypted),
      ...Object.keys(rightDecrypted),
    ]);

    const diff = {
      added: [] as string[],
      modified: [] as Array<{
        key: string;
        oldValue: string;
        newValue: string;
      }>,
      removed: [] as string[],
    };

    for (const key of allKeys) {
      const leftValue = leftDecrypted[key];
      const rightValue = rightDecrypted[key];

      if (!leftValue && rightValue) {
        diff.added.push(key);
      } else if (leftValue && !rightValue) {
        diff.removed.push(key);
      } else if (leftValue !== rightValue) {
        diff.modified.push({
          key,
          oldValue: leftValue,
          newValue: rightValue,
        });
      }
    }

    return NextResponse.json({
      leftVersion: {
        ...leftVersion,
        content: leftDecrypted,
      },
      rightVersion: {
        ...rightVersion,
        content: rightDecrypted,
      },
      diff,
      stats: {
        added: diff.added.length,
        modified: diff.modified.length,
        removed: diff.removed.length,
        total: allKeys.size,
      },
    });
  } catch (error) {
    console.error("[VERSION_COMPARE_POST]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

// Get comparison options (available versions)
export async function GET(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const { userId, projectId } = await params;

    // Authentication
    const headersList = await headers();
    const cliUser = await validateCliAuth(headersList);
    const webUser = await getCurrentUserFromSession();

    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

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

    // Get all versions for comparison
    const versions = await db.envVersion.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 versions for performance
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("[VERSION_COMPARE_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
