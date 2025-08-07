import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { decryptEnvValues } from "@/lib/encryption";
import { headers } from "next/headers";
import { AuthUser, validateCliAuth } from "../../../route";
import { decryptEnv } from "@/lib/actions/decrypt";

// Get all versions for a project
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string; projectId: string; versionId: string }>;
  },
): Promise<NextResponse> {
  try {
    const { userId } = await params;
    // read request headers sent from the cli
    const headersList = await headers();
    // validate cli request headers
    const cliUser = await validateCliAuth(headersList);

    // read web request headers
    const webUser = await getCurrentUserFromSession();

    // validate either cli or web request headers
    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    const { projectId, versionId } = await params;
    const user = webUser || cliUser;
    if (!user) {
      return ErrorResponse("Unauthorized", 401);
    }

    // find for the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      return ErrorResponse("Unauthorized", 401);
    }
    // Verify user has access to the project
    const version = await db.envVersion.findFirst({
      where: {
        id: versionId,
        projectId,
      },
      select: {
        user: true,
        projectId: true,
        id: true,
        changes: true,
        content: true,
        createdAt: true,
        createdBy: true,
        description: true,
        VersionTag: true,
      },
    });

    if (!version) {
      return ErrorResponse("Version not found or unauthorized", 404);
    }

    const decryptedContent = await decryptEnv(
      version.content as Record<string, string>,
      project.userId,
    );
    return NextResponse.json({ ...version, content: decryptedContent });
  } catch (error) {
    console.error("[VERSIONS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
