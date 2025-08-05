import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@nvii/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function validateCliAuth(
  headers: Headers,
): Promise<AuthUser | null> {
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

    const projects = await db.project.findMany({
      where: {
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

    const body = await request.json();

    // check for duplicate project names
    const existingProject = await db.project.findFirst({
      where: {
        userId: user?.id,
        name: body.name,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { message: "Project with this name already exists" },
        { status: 400 },
      );
    }

    const authenticatedUser = await db.user.findUnique({
      where: { id: user?.id },
    });

    if (!authenticatedUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const authenticatedUserDeviceId = await db.device.findFirst({
      where: {
        userId: authenticatedUser.id,
      },
    });
    if (!authenticatedUserDeviceId && cliUser) {
      // block only cli requests with no device ids
      return ErrorResponse("Unauthorized", 401);
    }

    const project = await db.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          userId,
          name: body.name,
          deviceId: authenticatedUserDeviceId?.id ?? undefined,
          content: body.content,
          description: body.description ?? "",
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
          createdBy: user?.id as string,
        },
      });

      return newProject;
    });
    return Response(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
