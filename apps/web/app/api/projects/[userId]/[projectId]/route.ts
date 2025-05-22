import { getClerkUser } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@workspace/db";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ userId: string; projectId: string }> }
): Promise<NextResponse> => {
  const { userId, projectId } = await params;

  const user = await getClerkUser(userId);

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

  return Response(project);
};

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ userId: string; projectId: string }> }
): Promise<NextResponse> => {
  const { userId, projectId } = await params;

  const user = await getClerkUser(userId);

  if (!user) {
    return ErrorResponse("Unauthorized", 401);
  }

  const projectExists = await db.project.findUnique({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!projectExists) {
    return ErrorResponse("Project not found", 404);
  }

  const body = await request.json();

  const project = await db.project.update({
    where: {
      id: projectId,
    },
    data: {
      content: body.content,
    },
  });

  return Response(project);
};
