import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db, EnvVersion } from "@nvii/db";
import { NextResponse } from "next/server";
import { decryptEnvValues } from "@/lib/encryption";
import { headers } from "next/headers";
import { AuthUser, validateCliAuth } from "../../route";
import { decryptEnv } from "@/lib/actions/decrypt";

// Get all versions for a project
export async function GET(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const { userId } = await params;
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

    const { projectId } = await params;
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

    const decryptedVersions: unknown[] = [];
    const handleDecrypt = async () => {
      versions.map(async (item) => {
        const decryptedContent = await decryptEnv(
          item.content as Record<string, string>,
          project.userId,
        );

        decryptedVersions.push({
          ...item,
          content: decryptedContent,
        });
      });
    };

    await handleDecrypt();

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
    const { userId } = await params;
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

    const { projectId } = await params;
    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

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

    return NextResponse.json(version);
  } catch (error) {
    console.error("[VERSION_POST]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
