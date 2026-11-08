import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { decryptEnv } from "@/lib/actions/decrypt";
import { validateCliAuth } from "@/lib/cli-auth";

function toEnvFormat(content: Record<string, string>): string {
  return Object.entries(content)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

// Export a version as a downloadable env or json file
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string; projectId: string; versionId: string }>;
  }
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") === "json" ? "json" : "env";

    const headersList = await headers();
    const cliUser = await validateCliAuth(headersList);
    const webUser = await getCurrentUserFromSession();

    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { projectId, versionId } = await params;
    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    const project = await db.project.findUnique({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          {
            ProjectAccess: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    if (!project) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }

    const version = await db.envVersion.findFirst({
      where: {
        id: versionId,
        projectId,
      },
    });

    if (!version) {
      return ErrorResponse("Version not found or unauthorized", 404);
    }

    const decryptedContent = await decryptEnv(
      version.content as Record<string, string>,
      project.userId
    );

    const body =
      format === "json"
        ? JSON.stringify(decryptedContent, null, 2)
        : toEnvFormat(decryptedContent as Record<string, string>);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": format === "json" ? "application/json" : "text/plain",
        "Content-Disposition": `attachment; filename="version-${version.id.slice(0, 8)}.${format === "json" ? "json" : "env"}"`,
      },
    });
  } catch (error) {
    console.error("[VERSION_EXPORT]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
