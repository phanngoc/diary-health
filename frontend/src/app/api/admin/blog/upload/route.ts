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

// POST /api/admin/blog/upload - Upload image for blog post
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Forward the formData to admin backend
    const response = await makeAdminRequest(
      '/blog-posts/upload',
      {
        method: 'POST',
        body: formData,
      },
      token.access_token as string
    );
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
