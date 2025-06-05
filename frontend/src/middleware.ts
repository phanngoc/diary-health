import { NextRequest, NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';

// Default export middleware function
export default async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;
  console.log("Middleware pathname:", pathname);

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to login if not authenticated
    if (!token) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }

    // Check if user has admin privileges
    if (!token.isAdmin || token.role !== 'admin') {
      // Redirect to unauthorized page or main login
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Handle admin API routes
  if (pathname.startsWith('/api/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Return 401 if not authenticated
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return 403 if not admin
    if (!token.isAdmin || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Check if token exists in cookies for regular routes
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
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
