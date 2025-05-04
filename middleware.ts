import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = 
    request.nextUrl.pathname.startsWith("/auth/giris") || 
    request.nextUrl.pathname.startsWith("/auth/kayit");
  
  // Redirect to login page if not authenticated and trying to access protected routes
  if (!token && !request.nextUrl.pathname.startsWith("/auth") && 
      request.nextUrl.pathname !== "/" && 
      !request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.redirect(new URL("/auth/giris", request.url));
  }
  
  // Redirect to dashboard if already authenticated and trying to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/kontrol-paneli", request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}; 