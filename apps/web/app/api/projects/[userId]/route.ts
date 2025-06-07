import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@workspace/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

async function validateCliAuth(headers: Headers): Promise<AuthUser | null> {
  const userId = headers.get("X-User-Id");
  const deviceId = headers.get("X-Device-Id");
  const authCode = headers.get("X-Auth-Code");

  if (!userId || !deviceId || !authCode) {
    return null;
  }

  // Verify the device exists and belongs to the user
  const device = await db.device.findFirst({
    where: {
      userId,
      id: deviceId,
      code: authCode,
    },
  });

  if (!device) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user as AuthUser | null;
}

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> => {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { userId } = await params;

    const projects = await db.project.findMany({
      where: {
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
};

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> => {
  try {
    const { userId } = await params;
    const headersList = await headers();

    let user = await validateCliAuth(headersList);

    if (!user) {
      user = (await getCurrentUserFromSession()) as AuthUser | null;
    }

    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (user.id !== userId) {
      return ErrorResponse("Unauthorized - User ID mismatch", 401);
    }

    const body = await request.json();

    const project = await db.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          userId,
          name: body.name,
          deviceId: body.deviceId,
          content: body.content,
        },
      });

      await tx.projectAccess.create({
        data: {
          projectId: newProject.id,
          userId: userId,
        },
      });

      await tx.envVersion.create({
        data: {
          projectId: newProject.id,
          content: body.content,
          description: "Initial version",
          changes: {
            added: Object.keys(body.content || {}),
            modified: [],
            deleted: [],
          },
          createdBy: user.id,
        },
      });

      return newProject;
    });

    return Response(project);
  } catch (error) {
    console.error(error);
    return ErrorResponse("Internal Server Error", 500);
  }
};
