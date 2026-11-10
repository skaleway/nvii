import { auth } from "@/lib/auth";
import { decryptEnvValues } from "@/lib/encryption";
import { analyzeContent } from "@/lib/objects";
import { ErrorResponse } from "@/lib/response";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  listProjects,
  webProjectSelect,
  extractListQuery,
} from "@/lib/projects-list";
import { z } from "zod";

export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return ErrorResponse("Unauthorized", 401);
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
    viewerId: session.user.id,
    limit: parsed.limit,
    offset: parsed.offset,
    search: parsed.search,
    select: webProjectSelect,
  });

  const formattedProjects = items.map((project) => {
    let decryptedContent = {};
    if (project.content && typeof project.content === "object") {
      decryptedContent = decryptEnvValues(
        project.content as Record<string, string>,
        project.user.id
      );
    }

    return {
      ...project,
      content: analyzeContent(decryptedContent),
    };
  });

  return NextResponse.json({ items: formattedProjects, total, limit, offset });
}
