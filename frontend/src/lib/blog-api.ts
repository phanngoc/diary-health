// Blog API functions for admin management
import { getToken } from './api';
import { MockBlogAPI } from './mock-blog-data';

const API_BASE_URL = process.env.ADMIN_API_URL || '';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'y-te' | 'suc-khoe' | 'thuoc';
  tags: string[];
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  meta_description?: string;
  meta_keywords?: string;
  views_count: number;
}

export interface CreateBlogPost {
  title: string;
  content: string;
  excerpt: string;
  category: 'y-te' | 'suc-khoe' | 'thuoc';
  tags: string[];
  featured_image?: string;
  status: 'draft' | 'published';
  meta_description?: string;
  meta_keywords?: string;
}

export interface UpdateBlogPost extends Partial<CreateBlogPost> {
  id: string;
}

export interface BlogPostFilter {
  category?: 'y-te' | 'suc-khoe' | 'thuoc';
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  page?: number;
  limit?: number;
}

class BlogAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Get all blog posts with filters
  async getPosts(filters: BlogPostFilter = {}): Promise<{
    data: BlogPost[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = `/api/admin/blog/posts${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<{
      data: BlogPost[];
      total: number;
      page: number;
      limit: number;
    }>(endpoint);
  }

  // Get a single blog post by ID
  async getPost(id: string): Promise<BlogPost> {
    return this.makeRequest<BlogPost>(`/api/admin/blog/posts/${id}`);
  }

  // Create a new blog post
  async createPost(data: CreateBlogPost): Promise<BlogPost> {
    return this.makeRequest<BlogPost>('/api/admin/blog/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a blog post
  async updatePost(data: UpdateBlogPost): Promise<BlogPost> {
    const { id, ...updateData } = data;
    return this.makeRequest<BlogPost>(`/api/admin/blog/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete a blog post
  async deletePost(id: string): Promise<void> {
    return this.makeRequest<void>(`/api/admin/blog/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Publish a draft post
  async publishPost(id: string): Promise<BlogPost> {
    return this.makeRequest<BlogPost>(`/api/admin/blog/posts/${id}/publish`, {
      method: 'PATCH',
    });
  }

  // Archive a post
  async archivePost(id: string): Promise<BlogPost> {
    return this.makeRequest<BlogPost>(`/api/admin/blog/posts/${id}/archive`, {
      method: 'PATCH',
    });
  }

  // Upload image for blog post
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/blog/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }
    
    return response.json();
  }

  // Get blog statistics
  async getStats(): Promise<{
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    archived_posts: number;
    categories: Record<string, number>;
    recent_posts: BlogPost[];
  }> {
    
    return this.makeRequest<{
      total_posts: number;
      published_posts: number;
      draft_posts: number;
      archived_posts: number;
      categories: Record<string, number>;
      recent_posts: BlogPost[];
    }>('/api/admin/blog/stats');
  }
}

export const blogAPI = new BlogAPI();
