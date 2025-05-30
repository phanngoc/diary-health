import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3000/api';

// Helper function to make requests to admin backend
async function makeAdminRequest(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const url = `${ADMIN_API_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response;
}

// POST /api/admin/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await makeAdminRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 401 }
    );
  }
}
