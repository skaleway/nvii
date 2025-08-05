import { auth } from "@/lib/auth";
import { db } from "@nvii/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!code || code.trim().length === 0)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        optsCode: code,
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Error updating user data" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        code,
        username: session.user.name,
        email: session.user.email,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
