import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { decryptEnv } from "@/lib/actions/decrypt";
import { validateCliAuth } from "@/lib/cli-auth";

// Get all versions for a project
export async function GET(
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

    // find for the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      return ErrorResponse("Unauthorized", 401);
    }
    // Verify user has access to the project
    const version = await db.envVersion.findFirst({
      where: {
        id: versionId,
        projectId,
      },
      select: {
        user: true,
        projectId: true,
        id: true,
        changes: true,
        content: true,
        createdAt: true,
        createdBy: true,
        description: true,
        VersionTag: true,
      },
    });

    if (!version) {
      return ErrorResponse("Version not found or unauthorized", 404);
    }

    const decryptedContent = await decryptEnv(
      version.content as Record<string, string>,
      project.userId
    );
    return NextResponse.json({ ...version, content: decryptedContent });
  } catch (error) {
    console.error("[VERSIONS_PATCH]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

// Update current version
export async function PATCH(
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

    // find for the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      return ErrorResponse("Unauthorized", 401);
    }

    // Transaction: clear current, then set new current
    const [_, setCurrentResult] = await db.$transaction([
      db.envVersion.updateMany({
        where: {
          projectId,
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      }),
      db.envVersion.updateMany({
        where: {
          id: versionId,
          projectId,
        },
        data: {
          isCurrent: true,
        },
      }),
    ]);

    if (!setCurrentResult || setCurrentResult.count === 0) {
      return ErrorResponse("Version not found or unauthorized", 404);
    }

    // Optionally, fetch the updated version to return
    const version = await db.envVersion.findUnique({
      where: {
        id: versionId,
        projectId,
      },
    });

    return NextResponse.json({
      version,
      message: "Version set to current successfully!",
    });
  } catch (error) {
    console.error("[VERSIONS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
