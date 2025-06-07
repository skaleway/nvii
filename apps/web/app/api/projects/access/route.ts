import { auth } from "@/lib/auth";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@workspace/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const body = await request.json();
    const { projectId, userEmail } = body;

    if (!session) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (!projectId || !userEmail) {
      return ErrorResponse("Project ID and user email are required", 400);
    }

    // Check if user owns the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or not authorized", 404);
    }

    // Find user by email
    const userToAdd = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!userToAdd) {
      return ErrorResponse("User not found", 404);
    }

    // Add access
    const projectAccess = await db.projectAccess.create({
      data: {
        projectId,
        userId: userToAdd.id,
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
    console.error("[PROJECT_ACCESS_POST]", error);
    return ErrorResponse("Internal error", 500);
  }
}

// Remove user access from a project
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userIdToRemove = searchParams.get("userIdToRemove");

    if (!session) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (!projectId || !userIdToRemove) {
      return ErrorResponse("Project ID and user ID are required", 400);
    }

    // Check if user owns the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or not authorized", 404);
    }

    // Remove access
    await db.projectAccess.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: userIdToRemove,
        },
      },
    });

    return Response(null);
  } catch (error) {
    console.error("[PROJECT_ACCESS_DELETE]", error);
    return ErrorResponse("Internal error", 500);
  }
}
