import { NextRequest, NextResponse } from 'next/server';
import { makeAdminRequest } from '@/lib/admin-api-utils';

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
