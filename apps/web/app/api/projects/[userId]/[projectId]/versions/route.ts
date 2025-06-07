import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@workspace/db";
import { NextResponse } from "next/server";
import { decryptEnvValues } from "@/lib/encryption";

// Get all versions for a project
export async function GET(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { userId, projectId } = params;

    // Verify user has access to the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        OR: [
          { userId: userId },
          {
            ProjectAccess: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    // Get all versions
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
    });

    // Decrypt content for each version
    const decryptedVersions = versions.map((version) => ({
      ...version,
      content: version.content
        ? decryptEnvValues(version.content as Record<string, string>, user.id)
        : null,
    }));

    return NextResponse.json(decryptedVersions);
  } catch (error) {
    console.error("[VERSIONS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

// Create a new version
export async function POST(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { userId, projectId } = params;
    const body = await request.json();
    const { content, description, changes } = body;

    // Verify user has access to the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        OR: [
          { userId: userId },
          {
            ProjectAccess: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    // Create new version
    const version = await db.envVersion.create({
      data: {
        projectId,
        content,
        description,
        changes: JSON.parse(JSON.stringify(changes)),
        createdBy: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Decrypt content before sending response
    const decryptedVersion = {
      ...version,
      content: version.content
        ? decryptEnvValues(version.content as Record<string, string>, user.id)
        : null,
    };

    return NextResponse.json(decryptedVersion);
  } catch (error) {
    console.error("[VERSION_POST]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
