import { NextResponse } from "next/server";
import { db } from "@workspace/db";
import { getCurrentUserFromSession } from "@/lib/current-user";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const versions = await db.envVersion.findMany({
      where: {
        projectId: params.projectId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("[VERSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content, description, changes } = body;

    const version = await db.envVersion.create({
      data: {
        projectId: params.projectId,
        content,
        description,
        changes,
        createdBy: user.id,
      },
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error("[VERSION_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
