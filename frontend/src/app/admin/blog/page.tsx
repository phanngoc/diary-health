'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogPost, BlogPostFilter, blogAPI } from '@/lib/blog-api';
import { BlogPostEditor } from '@/components/blog/BlogPostEditor';
import { BlogPostList } from '@/components/blog/BlogPostList';
import { BlogStats } from '@/components/blog/BlogStats';
import { toast } from 'sonner';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BlogPostFilter>({
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Load posts
  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getPosts(filters);
      setPosts(response.data);
      setTotalPosts(response.total);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await blogAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadPosts();
    loadStats();
  }, [filters]);

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1
    }));
  };

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters(prev => ({
      ...prev,
      category: category === 'all' ? undefined : category as any,
      page: 1
    }));
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as any,
      page: 1
    }));
  };

  // Handle post actions
  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    
    try {
      await blogAPI.deletePost(postId);
      toast.success('Xóa bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Không thể xóa bài viết');
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      await blogAPI.publishPost(postId);
      toast.success('Xuất bản bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Không thể xuất bản bài viết');
    }
  };

  const handleArchivePost = async (postId: string) => {
    try {
      await blogAPI.archivePost(postId);
      toast.success('Lưu trữ bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error) {
      console.error('Error archiving post:', error);
      toast.error('Không thể lưu trữ bài viết');
    }
  };

  const handlePostSaved = () => {
    setShowEditor(false);
    setEditingPost(null);
    loadPosts();
    loadStats();
  };

  const categoryLabels = {
    'y-te': 'Y tế',
    'suc-khoe': 'Sức khỏe',
    'thuoc': 'Thuốc'
  };

  const statusLabels = {
    'draft': 'Bản nháp',
    'published': 'Đã xuất bản',
    'archived': 'Đã lưu trữ'
  };

  if (showEditor) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowEditor(false);
              setEditingPost(null);
            }}
          >
            ← Quay lại danh sách
          </Button>
        </div>
        <BlogPostEditor
          post={editingPost}
          onSave={handlePostSaved}
          onCancel={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Blog Y tế & Sức khỏe</h1>
          <p className="text-muted-foreground">
            Quản lý nội dung về y tế, sức khỏe và thuốc
          </p>
        </div>
        <Button onClick={() => setShowEditor(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo bài viết mới
        </Button>
      </div>

      {/* Stats */}
      {stats && <BlogStats stats={stats} />}

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Bài viết</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tìm kiếm bài viết..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      <SelectItem value="y-te">Y tế</SelectItem>
                      <SelectItem value="suc-khoe">Sức khỏe</SelectItem>
                      <SelectItem value="thuoc">Thuốc</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="archived">Đã lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <BlogPostList
            posts={posts}
            loading={loading}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onPublish={handlePublishPost}
            onArchive={handleArchivePost}
            categoryLabels={categoryLabels}
            statusLabels={statusLabels}
          />

          {/* Pagination */}
          {totalPosts > 0 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(prev => prev - 1);
                  setFilters(prev => ({ ...prev, page: currentPage - 1 }));
                }}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {Math.ceil(totalPosts / (filters.limit || 10))}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= Math.ceil(totalPosts / (filters.limit || 10))}
                onClick={() => {
                  setCurrentPage(prev => prev + 1);
                  setFilters(prev => ({ ...prev, page: currentPage + 1 }));
                }}
              >
                Sau
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Y tế
                </CardTitle>
                <CardDescription>
                  Nội dung về y học, bệnh tật, điều trị
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.categories?.['y-te'] || 0}
                </div>
                <p className="text-sm text-muted-foreground">bài viết</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Sức khỏe
                </CardTitle>
                <CardDescription>
                  Lời khuyên, tips sống khỏe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.categories?.['suc-khoe'] || 0}
                </div>
                <p className="text-sm text-muted-foreground">bài viết</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Thuốc
                </CardTitle>
                <CardDescription>
                  Thông tin về thuốc, cách dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.categories?.['thuoc'] || 0}
                </div>
                <p className="text-sm text-muted-foreground">bài viết</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tất cả bài viết trong hệ thống
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.published_posts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Bài viết công khai
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.draft_posts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Đang soạn thảo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã lưu trữ</CardTitle>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.archived_posts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Không còn hiển thị
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Posts */}
          {stats?.recent_posts && stats.recent_posts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bài viết gần đây</CardTitle>
                <CardDescription>
                  5 bài viết được tạo gần đây nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recent_posts.map((post: BlogPost) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{categoryLabels[post.category]}</Badge>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {statusLabels[post.status]}
                          </Badge>
                          <span>• {new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
