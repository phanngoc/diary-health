import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { makeAdminRequest } from '@/lib/admin-api-utils';

// GET /api/admin/blog/stats - Get blog statistics
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const response = await makeAdminRequest(
      '/blog-posts/statistics',
      {},
      adminUser.accessToken
    );
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching blog statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog statistics' },
      { status: 500 }
    );
  }
}
