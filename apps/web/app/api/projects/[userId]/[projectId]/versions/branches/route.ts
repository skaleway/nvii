import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateCliAuth } from "@/lib/cli-auth";

// Get all branches for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string; projectId: string }> },
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

    // Get all branches
    const branches = await db.versionBranch.findMany({
      where: {
        projectId,
      },
      include: {
        baseVersion: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error("[BRANCHES_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

// Create a new branch
export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      userId: string;
      projectId: string;
    }>;
  },
): Promise<NextResponse> {
  try {
    const { projectId } = await params;

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
    const { branchName, baseVersionId, description } = body;

    if (!branchName) {
      return ErrorResponse("Branch name is required", 400);
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

    // If no base version specified, get the latest version from main branch
    let finalBaseVersionId = baseVersionId;
    if (!finalBaseVersionId) {
      const latestVersion = await db.envVersion.findFirst({
        where: {
          projectId,
          branch: branchName,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!latestVersion) {
        return ErrorResponse(
          "No base version found to create branch from",
          400,
        );
      }

      finalBaseVersionId = latestVersion.id;
    }

    // Verify base version exists and belongs to this project
    const baseVersion = await db.envVersion.findFirst({
      where: {
        id: finalBaseVersionId,
        projectId,
      },
    });

    if (!baseVersion) {
      return ErrorResponse("Base version not found", 404);
    }

    // Check if branch name already exists
    const existingBranch = await db.versionBranch.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: branchName,
        },
      },
    });

    if (existingBranch) {
      return ErrorResponse("Branch name already exists", 409);
    }

    // Create the branch
    const branch = await db.versionBranch.create({
      data: {
        name: branchName,
        projectId,
        baseVersionId: finalBaseVersionId,
        description,
      },
      include: {
        baseVersion: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error("[BRANCH_POST]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
