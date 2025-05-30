import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Admin route validation middleware
export async function validateAdminRoute(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check if user is authenticated
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Check if user has admin privileges
  if (!token.isAdmin || token.role !== 'admin') {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return null; // No error, continue processing
}

// Admin API request helper with validation
export async function withAdminValidation(
  request: NextRequest,
  handler: (token: any) => Promise<NextResponse>
) {
  const validationResult = await validateAdminRoute(request);
  if (validationResult) {
    return validationResult;
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  return handler(token);
}

// Helper to get admin user info from token
export async function getAdminUser(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token || !token.isAdmin) {
    return null;
  }

  return {
    id: token.id,
    email: token.email,
    role: token.role,
    isAdmin: token.isAdmin,
    accessToken: token.accessToken
  };
}

// Validate if user can access admin panel
export function isAdminUser(token: any): boolean {
  return !!(token && token.isAdmin && token.role === 'admin');
}
