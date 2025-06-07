import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db, Project, ProjectAccess } from "@workspace/db";
import { decryptEnvValues } from "@/lib/encryption";
import { calculateChanges } from "@/lib/version-helpers";
import { NextResponse } from "next/server";
import { User } from "better-auth";

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

    // Verify the user has access to this project
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
      include: {
        ProjectAccess: true,
      },
    });

    if (!project) {
      return ErrorResponse("Project not found", 404);
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    const { userId, projectId } = params;

    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const existingProject = await db.project.findUnique({
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

    if (!existingProject) {
      return ErrorResponse("Project not found", 404);
    }

    const body = await request.json();
    const { content, description } = body;

    // Calculate changes between old and new content
    const changes = calculateChanges(
      existingProject.content as Record<string, string> | null,
      content,
    );

    // Create new version and update project in a transaction
    const [project] = await db.$transaction([
      db.project.update({
        where: {
          id: projectId,
        },
        data: {
          content,
        },
      }),
      db.envVersion.create({
        data: {
          projectId,
          content,
          description,
          changes: JSON.parse(JSON.stringify(changes)),
          createdBy: user.id,
        },
      }),
    ]);

    // Decrypt the content before sending the response
    if (project.content && typeof project.content === "object") {
      project.content = decryptEnvValues(
        project.content as Record<string, string>,
        user.id,
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_PATCH]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string; projectId: string } },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    const { userId, projectId } = params;

    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

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
      include: {
        ProjectAccess: true,
      },
    });

    if (!project) {
      return ErrorResponse("Project not found", 404);
    }

    if (!canDeleteProject(project, user)) {
      return ErrorResponse("Unauthorized", 401);
    }

    await db.project.delete({
      where: { id: projectId },
    });

    return Response("Project deleted", 200);
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

const canDeleteProject = (
  project: Project & { ProjectAccess: ProjectAccess[] },
  user: User,
) => {
  return (
    project.userId === user.id ||
    project.ProjectAccess.some((access) => access.userId === user.id)
  );
};
