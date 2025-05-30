import { NextRequest, NextResponse } from 'next/server';

// Middleware function to handle common API logic
export function withAdminApi(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Log the request
      console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
      
      // Call the actual handler
      const response = await handler(request, ...args);
      
      // Log the response status
      console.log(`[${new Date().toISOString()}] Response: ${response.status}`);
      
      return response;
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] API Error:`, error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Handle other errors
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// CORS headers for admin API routes
export const adminApiHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
export function handleCors(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: adminApiHeaders,
    });
  }
  return null;
}
