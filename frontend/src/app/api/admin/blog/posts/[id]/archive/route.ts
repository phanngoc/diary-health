import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { makeAdminRequest } from '@/lib/admin-api-utils';

// PATCH /api/admin/blog/posts/[id]/archive - Archive a blog post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Update post status to archived
    const updateData = {
      status: 'archived',
    };

    const response = await makeAdminRequest(
      `/blog-posts/${params.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      },
      adminUser.accessToken
    );
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error archiving blog post:', error);
    return NextResponse.json(
      { error: 'Failed to archive blog post' },
      { status: 500 }
    );
  }
}
