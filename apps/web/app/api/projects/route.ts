import { getClerkUser } from "@/lib/current-user";
import { analyzeContent } from "@/lib/objects";
import { ErrorResponse } from "@/lib/response";
import { Variable } from "@/types/project";
import { auth } from "@clerk/nextjs/server";
import { db } from "@workspace/db";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return ErrorResponse("Unauthorized", 401);
  }

  const user = await getClerkUser(userId);

  if (!user) {
    return ErrorResponse("Unauthorized", 401);
  }

  const projects = await db.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProjects = projects.map((project) => ({
    ...project,
    content: analyzeContent(project.content as Record<string, string>),
  }));

  return NextResponse.json(formattedProjects);
}
