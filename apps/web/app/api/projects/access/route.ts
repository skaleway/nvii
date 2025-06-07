import { auth } from "@/lib/auth";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@workspace/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserFromSession } from "@/lib/current-user";

// Get all users with access to a project
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!session) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (!projectId) {
      return ErrorResponse("Project ID is required", 400);
    }

    // Check if user owns the project or has access to it
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

    // Get all users with access except the current user
    const projectAccess = await db.projectAccess.findMany({
      where: {
        projectId,
        userId: { not: session.user.id }, // Exclude current user
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

// Add user access to a project
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { projectId, userId } = body;

    // Verify the user is the owner of the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: user.id, // Only project owner can grant access
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    // Create project access
    await db.projectAccess.create({
      data: {
        projectId,
        userId,
      },
    });

    return Response("Access granted", 200);
  } catch (error) {
    console.error("[PROJECT_ACCESS_POST]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

// Remove user access from a project
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { projectId, userId } = body;

    // Verify the user is the owner of the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: user.id, // Only project owner can revoke access
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    // Remove project access
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
