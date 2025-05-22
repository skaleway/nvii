import { db } from "@workspace/db";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const projects = await db.project.findMany();

  return NextResponse.json(projects);
}
