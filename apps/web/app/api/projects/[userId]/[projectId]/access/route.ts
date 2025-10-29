import { auth } from "@/lib/auth";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@nvii/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserFromSession } from "@/lib/current-user";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { projectId } = await params;

    if (!session) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (!projectId) {
      return ErrorResponse("Project ID is required", 400);
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { ProjectAccess: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or access denied", 404);
    }

    const projectAccess = await db.projectAccess.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(projectAccess);
  } catch (error) {
    console.error("[PROJECT_ACCESS_GET]", error);
    return ErrorResponse("Internal error", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string; projectId: string }> }
): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { projectId, userId } = await params;
    const { email } = body;

    const userExists = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!userExists) {
      return ErrorResponse(`User email ${email} not found`, 400);
    }

    console.log({ userExists });

    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    await db.projectAccess.create({
      data: {
        projectId,
        userId: userExists.id,
      },
    });

    return Response("Access granted", 200);
  } catch (error) {
    console.error("[PROJECT_ACCESS_POST]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { projectId, userId } = body;

    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    await db.projectAccess.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return Response("Access revoked", 200);
  } catch (error) {
    console.error("[PROJECT_ACCESS_DELETE]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
