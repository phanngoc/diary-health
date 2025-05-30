// Helper utilities for admin API communication
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3000/api';

export interface AdminApiOptions extends RequestInit {
  skipAuth?: boolean;
}

// Helper function to make authenticated requests to admin backend
export async function makeAdminRequest(
  endpoint: string,
  options: AdminApiOptions = {},
  token?: string
) {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = `${ADMIN_API_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !skipAuth && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response;
}

// Get admin token from NextAuth JWT
export async function getAdminToken(request: NextRequest): Promise<string | null> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return token?.access_token as string || null;
}

// Validate admin authentication
export async function validateAdminAuth(request: NextRequest) {
  const token = await getAdminToken(request);
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return token;
}

// Handle admin API errors consistently
export function handleAdminError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage + ':', error);
  
  if (error instanceof Error) {
    return { error: error.message };
  }
  
  return { error: defaultMessage };
}

// Transform blog post data between frontend and backend formats
export function transformBlogPostForBackend(data: any) {
  return {
    ...data,
    // Transform tags array to comma-separated string if needed
    tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
    // Map frontend category values to backend enum values
    type: data.category === 'y-te' ? 'HEALTH' :
          data.category === 'suc-khoe' ? 'WELLNESS' :
          data.category === 'thuoc' ? 'MEDICINE' : 'HEALTH',
  };
}

export function transformBlogPostFromBackend(data: any) {
  return {
    ...data,
    // Transform tags string to array if needed
    tags: typeof data.tags === 'string' ? data.tags.split(',').filter(Boolean) : data.tags || [],
    // Map backend enum values to frontend category values
    category: data.type === 'HEALTH' ? 'y-te' :
              data.type === 'WELLNESS' ? 'suc-khoe' :
              data.type === 'MEDICINE' ? 'thuoc' : 'y-te',
  };
}
