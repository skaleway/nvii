import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@workspace/db";
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
        { status: 400 }
      );

    let user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user && userId) {
      const response = await clerkClient().then((client) =>
        client.users.getUser(userId)
      );

      if (!response) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      user = await db.user.create({
        data: {
          id: response.id,
          email: response?.emailAddresses[0]?.emailAddress || "",
          name: response.firstName,
        },
      });
    }

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const deviceExist = await db.device.findFirst({
      where: {
        userId,
      },
    });

    if (deviceExist) {
      return NextResponse.json({ ...deviceExist, redirect }, { status: 200 });
    }

    const device = await db.device.create({
      data: {
        userId,
        code: code as string,
      },
    });

    return NextResponse.json(
      {
        ...device,
        redirect,
        code,
        username: user.name,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
