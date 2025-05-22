import { NextRequest, NextResponse } from "next/server";

// Default export middleware function
export default async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;
  console.log("Middleware pathname:", pathname);
  // Check if token exists in cookies
  const authCookie = request.cookies.get("authjs.session-token");
  const isAuthenticated = !!authCookie;
  console.log("Middleware isAuthenticated:", isAuthenticated, authCookie);
  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith("/medications") ||
    pathname.startsWith("/logs") ||
    pathname.startsWith("/alerts");
  
    console.log("Middleware isProtectedRoute:", isProtectedRoute);
  // Redirect to login if accessing a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/medications/:path*",
    "/logs/:path*",
    "/alerts/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
