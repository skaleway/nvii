import { NextResponse } from "next/server";

export const Response = <T>(data: T, status: number = 200) => {
  return NextResponse.json({ data, success: true }, { status });
};

export const ErrorResponse = (error: string, status: number = 500) => {
  return NextResponse.json({ error, success: false }, { status });
};
