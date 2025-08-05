import { auth } from "@/lib/auth";
import { db } from "@nvii/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { id, redirect, code } = await request.json();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!id || !redirect || !code)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

    // find the user and with the opts code
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
        optsCode: code,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // update the user table
    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        optsCode: "",
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Unexpected error occurred." },
        { status: 500 },
      );
    }

    const deviceExist = await db.device.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (deviceExist) {
      return NextResponse.json({ ...deviceExist, redirect }, { status: 200 });
    }

    const device = await db.device.create({
      data: {
        userId: session.user.id,
        code: code as string,
      },
    });

    return NextResponse.json(
      {
        ...device,
        redirect,
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
