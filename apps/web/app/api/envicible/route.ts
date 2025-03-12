import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { id, redirect, code } = await request.json();

  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!id || !redirect || !code)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

    let user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user && userId) {
      const response = await clerkClient().then((client) =>
        client.users.getUser(userId),
      );

      if (!response) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      user = await prisma.user.create({
        data: {
          id: response.id,
          email: response?.emailAddresses[0]?.emailAddress || "",
          name: response.firstName,
        },
      });
    }

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const device = await prisma.device.create({
      data: {
        userId,
        code: code as string,
      },
    });

    console.log(device);

    return NextResponse.json({ ...device, redirect, code }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
