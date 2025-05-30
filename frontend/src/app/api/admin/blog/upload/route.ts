import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { makeAdminRequest } from '@/lib/admin-api-utils';

// POST /api/admin/blog/upload - Upload image for blog post
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Forward the formData to admin backend
    const response = await makeAdminRequest(
      '/blog-posts/upload',
      {
        method: 'POST',
        body: formData,
      },
      adminUser.accessToken
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
