import { NextRequest, NextResponse } from 'next/server';
import { 
  makeAdminRequest, 
  validateAdminAuth, 
  handleAdminError,
  transformBlogPostForBackend,
  transformBlogPostFromBackend 
} from '@/lib/admin-api-utils';

// GET /api/admin/blog/posts - Get all blog posts
export async function GET(request: NextRequest) {
  try {
    const token = await validateAdminAuth(request);

    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const endpoint = `/blog-posts${queryString ? `?${queryString}` : ''}`;
    const response = await makeAdminRequest(endpoint, {}, token);
    
    const data = await response.json();
    
    // Transform blog posts from backend format to frontend format
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map(transformBlogPostFromBackend);
    }
    
    return NextResponse.json(data);

  } catch (error) {
    const errorResponse = handleAdminError(error, 'Failed to fetch blog posts');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/admin/blog/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const token = await validateAdminAuth(request);

    const body = await request.json();
    
    // Transform frontend format to backend format
    const postData = transformBlogPostForBackend({
      ...body,
      authorId: 'admin', // Set default author for now
    });

    const response = await makeAdminRequest(
      '/blog-posts',
      {
        method: 'POST',
        body: JSON.stringify(postData),
      },
      token
    );
    
    const data = await response.json();
    const transformedData = transformBlogPostFromBackend(data);
    
    return NextResponse.json(transformedData);

  } catch (error) {
    const errorResponse = handleAdminError(error, 'Failed to create blog post');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
