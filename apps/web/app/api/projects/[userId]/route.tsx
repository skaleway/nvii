import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@workspace/db";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> => {
  try {
    const { userId } = await params;

    const user = await getCurrentUserFromSession();

    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const projects = await db.project.findMany({
      where: {
        userId,
      },
    });

    return Response(projects);
  } catch (error) {
    console.error(error);
    return ErrorResponse("Internal Server Error", 500);
  }
};

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> => {
  try {
    const { userId } = await params;

    const user = await getCurrentUserFromSession();

    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();

    // Create the project and ProjectAccess entry in a transaction
    const project = await db.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: {
          userId,
          name: body.name,
          deviceId: body.deviceId,
          content: body.content,
        },
      });

      // Create ProjectAccess entry for the creator
      await tx.projectAccess.create({
        data: {
          projectId: newProject.id,
          userId: userId,
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
