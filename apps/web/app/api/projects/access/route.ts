import { auth } from "@clerk/nextjs/server";
import { db } from "@workspace/db";
import { NextResponse } from "next/server";

// Get all users with access to a project
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!projectId) {
      return new NextResponse("Project ID is required", { status: 400 });
    }

    // Check if user owns the project or has access to it
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [{ userId }, { ProjectAccess: { some: { userId } } }],
      },
    });

    if (!project) {
      return new NextResponse("Project not found or access denied", {
        status: 404,
      });
    }

    // Get all users with access except the current user
    const projectAccess = await db.projectAccess.findMany({
      where: {
        projectId,
        userId: { not: userId }, // Exclude current user
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
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Add user access to a project
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { projectId, userEmail } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!projectId || !userEmail) {
      return new NextResponse("Project ID and user email are required", {
        status: 400,
      });
    }

    // Check if user owns the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return new NextResponse("Project not found or not authorized", {
        status: 404,
      });
    }

    // Find user by email
    const userToAdd = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!userToAdd) {
      return new NextResponse("User not found", { status: 404 });
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
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Remove user access from a project
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userIdToRemove = searchParams.get("userIdToRemove");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!projectId || !userIdToRemove) {
      return new NextResponse("Project ID and user ID are required", {
        status: 400,
      });
    }

    // Check if user owns the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return new NextResponse("Project not found or not authorized", {
        status: 404,
      });
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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROJECT_ACCESS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
