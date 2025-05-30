'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye, Send, Archive, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { BlogPost } from '@/lib/blog-api';

interface BlogPostListProps {
  posts: BlogPost[];
  loading: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onPublish: (postId: string) => void;
  onArchive: (postId: string) => void;
  categoryLabels: Record<string, string>;
  statusLabels: Record<string, string>;
}

export function BlogPostList({
  posts,
  loading,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  categoryLabels,
  statusLabels
}: BlogPostListProps) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Không có bài viết</h3>
            <p>Chưa có bài viết nào với bộ lọc hiện tại.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'y-te': return 'bg-blue-100 text-blue-800';
      case 'suc-khoe': return 'bg-green-100 text-green-800';
      case 'thuoc': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Main Content */}
              <div className="flex-1 space-y-3">
                {/* Title and Status */}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(post.category)}
                      >
                        {categoryLabels[post.category]}
                      </Badge>
                      <Badge variant={getStatusVariant(post.status)}>
                        {statusLabels[post.status]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        • {post.views_count} lượt xem
                      </span>
                    </div>
                  </div>
                  
                  {/* Featured Image */}
                  {post.featured_image && (
                    <div className="w-20 h-20 rounded border overflow-hidden flex-shrink-0">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {expandedPost === post.id 
                    ? post.excerpt 
                    : truncateText(post.excerpt, 150)
                  }
                  {post.excerpt.length > 150 && (
                    <button
                      onClick={() => setExpandedPost(
                        expandedPost === post.id ? null : post.id
                      )}
                      className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                    >
                      {expandedPost === post.id ? 'Ẩn bớt' : 'Xem thêm'}
                    </button>
                  )}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Tạo: {formatDate(post.created_at)}</span>
                  {post.updated_at !== post.created_at && (
                    <span>Cập nhật: {formatDate(post.updated_at)}</span>
                  )}
                  {post.published_at && (
                    <span>Xuất bản: {formatDate(post.published_at)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(post)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(post)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    
                    {post.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onPublish(post.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Xuất bản
                      </DropdownMenuItem>
                    )}
                    
                    {post.status === 'published' && (
                      <DropdownMenuItem onClick={() => onArchive(post.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Lưu trữ
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onDelete(post.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
