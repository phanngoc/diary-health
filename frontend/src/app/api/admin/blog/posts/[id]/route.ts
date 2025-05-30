import { NextRequest, NextResponse } from 'next/server';
import { 
  makeAdminRequest, 
  validateAdminAuth, 
  handleAdminError,
  transformBlogPostForBackend,
  transformBlogPostFromBackend 
} from '@/lib/admin-api-utils';

// GET /api/admin/blog/posts/[id] - Get a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await validateAdminAuth(request);

    const response = await makeAdminRequest(
      `/blog-posts/${params.id}`,
      {},
      token
    );
    
    const data = await response.json();
    const transformedData = transformBlogPostFromBackend(data);
    
    return NextResponse.json(transformedData);

  } catch (error) {
    const errorResponse = handleAdminError(error, 'Failed to fetch blog post');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// PUT /api/admin/blog/posts/[id] - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await validateAdminAuth(request);

    const body = await request.json();
    const transformedBody = transformBlogPostForBackend(body);

    const response = await makeAdminRequest(
      `/blog-posts/${params.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(transformedBody),
      },
      token
    );
    
    const data = await response.json();
    const transformedData = transformBlogPostFromBackend(data);
    
    return NextResponse.json(transformedData);

  } catch (error) {
    const errorResponse = handleAdminError(error, 'Failed to update blog post');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE /api/admin/blog/posts/[id] - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await validateAdminAuth(request);

    await makeAdminRequest(
      `/blog-posts/${params.id}`,
      {
        method: 'DELETE',
      },
      token
    );
    
    return NextResponse.json({ success: true });

  } catch (error) {
    const errorResponse = handleAdminError(error, 'Failed to delete blog post');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
