import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/", "/auth"];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const session = getSessionCookie(request.headers, {});

  if (!session) {
    if (publicRoutes.includes(pathName)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (publicRoutes.includes(pathName)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
  l;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
