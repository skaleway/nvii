import { getCurrentUserFromSession } from "@/lib/current-user";
import { ErrorResponse, Response } from "@/lib/response";
import { db } from "@nvii/db";
import { NextResponse } from "next/server";
import { decryptEnvValues } from "@/lib/encryption";
import { headers } from "next/headers";
import { AuthUser, validateCliAuth } from "../../../route";

// Get all versions for a project
export async function GET(
  request: Request,
  {
    params,
  }: { params: { userId: string; projectId: string; versionId: string } },
): Promise<NextResponse> {
  try {
    const { userId } = await params;
    // read request headers sent from the cli
    const headersList = await headers();
    // validate cli request headers
    let cliUser = await validateCliAuth(headersList);

    if (!cliUser) {
      cliUser = (await getCurrentUserFromSession()) as AuthUser | null;
    }
    // read web request headers
    const webUser = await getCurrentUserFromSession();

    // validate either cli or web request headers
    if (!webUser && !cliUser) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (cliUser?.id !== userId) {
      return ErrorResponse("Unauthorized", 401);
    }
    const { projectId, versionId } = await params;
    const user = cliUser || webUser;

    // Verify user has access to the project
    const version = await db.envVersion.findFirst({
      where: {
        id: versionId,
        projectId,
      },
    });

    if (!version) {
      return ErrorResponse("Project not found or unauthorized", 404);
    }
    return NextResponse.json(version);
  } catch (error) {
    console.error("[VERSIONS_GET]", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
