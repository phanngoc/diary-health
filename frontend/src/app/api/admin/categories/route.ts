import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth, makeAdminRequest } from '@/lib/admin-api-utils';

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const token = await validateAdminAuth(request);

    const response = await makeAdminRequest(
      '/categories',
      {},
      token
    );
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Admin authentication required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const token = await validateAdminAuth(request);
    const body = await request.json();

    const response = await makeAdminRequest(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      token
    );
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Admin authentication required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
