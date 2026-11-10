import { validateCliAuth } from "@/lib/cli-auth";
import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@nvii/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  listProjects,
  cliProjectSelect,
  extractListQuery,
} from "@/lib/projects-list";
import { z } from "zod";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
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

    // the path userId must match the authenticated caller
    if (userId !== user.id) {
      return ErrorResponse("Forbidden", 403);
    }

    let parsed: ReturnType<typeof extractListQuery>;
    try {
      parsed = extractListQuery(new URL(request.url).searchParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ErrorResponse("Invalid query parameters", 400);
      }
      throw error;
    }

    const { items, total, limit, offset } = await listProjects({
      viewerId: user.id,
      limit: parsed.limit,
      offset: parsed.offset,
      search: parsed.search,
      select: cliProjectSelect,
    });

    return NextResponse.json({ items, total, limit, offset });
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
};

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
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

    // the path userId must match the authenticated caller; this closes the
    // hole where any authenticated user could plant a project in another
    // account by putting that user's id in the path.
    if (userId !== user.id) {
      return ErrorResponse("Forbidden", 403);
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
        { error: "Project name already exist. Choose another name." },
        { status: 409 }
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
        include: {
          branches: true,
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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
