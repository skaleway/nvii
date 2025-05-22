import { getClerkUser, getCurrentUser } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@workspace/db";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> => {
  const { userId } = await params;

  const user = await getClerkUser(userId);

  if (!user) {
    return ErrorResponse("Unauthorized", 401);
  }

  const projects = await db.project.findMany({
    where: {
      userId,
    },
  });

  return Response(projects);
};

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> => {
  const { userId } = await params;

  const user = await getClerkUser(userId);

  if (!user) {
    return ErrorResponse("Unauthorized", 401);
  }

  const body = await request.json();

  const project = await db.project.create({
    data: {
      userId,
      name: body.name,
      deviceId: body.deviceId,
      content: body.content,
    },
  });

  return Response(project);
};
