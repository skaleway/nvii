import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { decryptEnvValues } from "@/lib/encryption";
import { headers } from "next/headers";
import { AuthUser, validateCliAuth } from "../../route";

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
    let cliUser = await validateCliAuth(headersList);

    if (!cliUser) {
      cliUser = (await getCurrentUserFromSession()) as AuthUser | null;
    }
    // read web request headers
    const webUser = await getCurrentUserFromSession();

    // validate either cli or web request headers
    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (cliUser?.id !== userId) {
      return ErrorResponse("Unauthorized", 401);
    }
    const { projectId } = await params;
    const user = cliUser || webUser;

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

    return NextResponse.json(versions);
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
    let cliUser = await validateCliAuth(headersList);

    if (!cliUser) {
      cliUser = (await getCurrentUserFromSession()) as AuthUser | null;
    }
    // read web request headers
    const webUser = await getCurrentUserFromSession();

    // validate either cli or web request headers
    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (cliUser?.id !== userId) {
      return ErrorResponse("Unauthorized", 401);
    }
    const { projectId } = await params;
    const user = cliUser || webUser;
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
