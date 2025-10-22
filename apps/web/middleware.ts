import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const authRoutes = ["/auth"];
const publicRoutes = ["/"];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPublicRoute = publicRoutes.includes(pathName);

  const session = getSessionCookie(request.headers, {});

  console.log({ session });

  if (!session) {
    if (isAuthRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
