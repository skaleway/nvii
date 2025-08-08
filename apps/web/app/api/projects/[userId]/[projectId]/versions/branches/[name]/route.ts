import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateCliAuth } from "../../../../route";

// Switch branch
export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      userId: string;
      projectId: string;
      name: string;
    }>;
  },
): Promise<NextResponse> {
  try {
    const { projectId, name } = await params;

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
    if (!name) {
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

    // Check if branch name already exists
    const existingBranch = await db.versionBranch.findUnique({
      where: {
        projectId_name: {
          projectId: project.id,
          name,
        },
      },
    });

    if (!existingBranch) {
      return ErrorResponse(
        "Branch name not found. Check available list of branches.",
        400,
      );
    }

    // Create the branch
    const branch = await db.versionBranch.update({
      where: {
        projectId_name: {
          projectId: existingBranch.projectId,
          name,
        },
      },
      data: {
        name,
        projectId,
        isActive: true,
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
