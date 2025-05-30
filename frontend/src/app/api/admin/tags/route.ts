import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRoute, getAdminUser } from '@/lib/admin-auth';
import { makeAdminRequest } from '@/lib/admin-api-utils';

// GET /api/admin/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const response = await makeAdminRequest('/tags', {}, adminUser.accessToken);
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();

    const response = await makeAdminRequest(
      '/tags',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      adminUser.accessToken
    );
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
