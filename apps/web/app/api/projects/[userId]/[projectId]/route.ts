import {
  getCurrentUserFromDb,
  getCurrentUserFromSession,
} from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db, Project } from "@nvii/db";
import { NextResponse } from "next/server";
import { User } from "better-auth";
import { headers } from "next/headers";
import { decryptEnv } from "@/lib/actions/decrypt";
import { calculateChanges, encryptEnvValues } from "@nvii/env-helpers";
import { validateCliAuth } from "@/lib/cli-auth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string; projectId: string }> },
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

    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }
    const { projectId } = await params;

    // Verify the user has access to this project
    const [project, versions] = await db.$transaction([
      db.project.findUnique({
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
        include: {
          ProjectAccess: true,
        },
      }),
      db.envVersion.findMany({
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
      }),
    ]);

    if (!project) {
      return ErrorResponse(`Project id <${projectId}> not found.`, 404);
    }

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

    const decryptedContent = await decryptEnv(
      project.content as Record<string, string>,
      project.userId,
    );

    return NextResponse.json({
      project: { ...project, content: decryptedContent },
      versions: decryptedVersions,
    });
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string; projectId: string }> },
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

    const existingProject = await db.project.findUnique({
      where: {
        id: projectId,
        OR: [
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
    const { content, message } = body;

    // Calculate changes between old and new content
    const decryptedExistingEnv = await decryptEnv(
      existingProject.content as Record<string, string>,
      existingProject.userId,
    );
    const changes = calculateChanges(decryptedExistingEnv, content);

    // Create new version and update project in a transaction

    const encryptedEnvs = encryptEnvValues(content, existingProject.userId);
    const [project, version] = await db.$transaction([
      db.project.update({
        where: {
          id: projectId,
        },
        data: {
          content: encryptedEnvs,
        },
      }),
      db.envVersion.create({
        data: {
          projectId,
          content: encryptedEnvs,
          description: message || "Updated environment variables",
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
      }),
    ]);

    const versions = await db.envVersion.findMany({
      where: {
        projectId: project.userId,
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

    const decryptedVersions: unknown[] = [];
    const handleDecrypt = async () => {
      versions.map(async (item) => {
        const decryptedContent = await decryptEnv(
          item.content as Record<string, string>,
          existingProject.userId,
        );

        decryptedVersions.push({
          ...item,
          content: decryptedContent,
        });
      });
    };

    await handleDecrypt();

    // Decrypt the content before sending the response
    const decryptedContent = await decryptEnv(
      version.content as Record<string, string>,
      existingProject.userId,
    );

    const decryptedProjectContent = await decryptEnv(
      project.content as Record<string, string>,
      existingProject.userId,
    );

    return NextResponse.json({
      version: {
        ...version,
        content: decryptedContent,
      },
      versions: decryptedVersions,
      project: { ...project, content: decryptedProjectContent },
    });
  } catch (error) {
    console.error("[PROJECT_PATCH]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string; projectId: string }> },
): Promise<NextResponse> {
  try {
    const { userId, projectId } = await params;
    // read request headers sent from the cli
    const headersList = await headers();
    // validate cli request headers
    const cliUser = await validateCliAuth(headersList);
    // read web request headers
    const webUser = await getCurrentUserFromDb();

    // validate either cli or web request headers
    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }
    const project = await db.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return ErrorResponse("Project not found", 404);
    }

    if (!canDeleteProject(project, user as User)) {
      return ErrorResponse("Unauthorized", 401);
    }

    await db.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      message: "Project deleted",
      name: project.name,
      status: 200,
    });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

const canDeleteProject = (project: Project, user: User) => {
  return project.userId === user.id;
};
