import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateCliAuth } from "@/lib/cli-auth";

// List tags for a version
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string; projectId: string; versionId: string }>;
  }
): Promise<NextResponse> {
  try {
    const headersList = await headers();
    const cliUser = await validateCliAuth(headersList);
    const webUser = await getCurrentUserFromSession();

    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { projectId, versionId } = await params;
    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

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

    const tags = await db.versionTag.findMany({
      where: {
        projectId,
        versionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("[VERSION_TAGS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

// Create a tag for a version
export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string; projectId: string; versionId: string }>;
  }
): Promise<NextResponse> {
  try {
    const headersList = await headers();
    const cliUser = await validateCliAuth(headersList);
    const webUser = await getCurrentUserFromSession();

    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { projectId, versionId } = await params;
    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return ErrorResponse("Tag name is required", 400);
    }

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

    const version = await db.envVersion.findFirst({
      where: {
        id: versionId,
        projectId,
      },
    });

    if (!version) {
      return ErrorResponse("Version not found or unauthorized", 404);
    }

    const existing = await db.versionTag.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return ErrorResponse("Tag name already exists", 409);
    }

    const tag = await db.versionTag.create({
      data: {
        projectId,
        versionId,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("[VERSION_TAGS_POST]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
