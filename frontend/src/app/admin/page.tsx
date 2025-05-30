'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Users, TrendingUp, Activity, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blogAPI } from '@/lib/blog-api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const blogStats = await blogAPI.getStats();
        setStats(blogStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      title: 'Tạo bài viết mới',
      description: 'Viết nội dung về y tế, sức khỏe',
      href: '/admin/blog',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Xem bài viết',
      description: 'Quản lý nội dung đã có',
      href: '/admin/blog',
      icon: Eye,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Tổng quan hệ thống quản lý nội dung y tế & sức khỏe
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg text-white ${action.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Tất cả nội dung trong hệ thống
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
              <Activity className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Y tế, Sức khỏe, Thuốc
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Phân bố danh mục</CardTitle>
            <CardDescription>
              Số lượng bài viết theo từng chuyên đề
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.categories || {}).map(([category, count]) => {
                const categoryLabels: Record<string, string> = {
                  'y-te': 'Y tế',
                  'suc-khoe': 'Sức khỏe',
                  'thuoc': 'Thuốc'
                };
                
                const categoryColors: Record<string, string> = {
                  'y-te': 'bg-blue-500',
                  'suc-khoe': 'bg-green-500',
                  'thuoc': 'bg-purple-500'
                };

                const percentage = stats.total_posts > 0 
                  ? Math.round((count / stats.total_posts) * 100) 
                  : 0;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {categoryLabels[category] || category}
                      </span>
                      <span className="text-muted-foreground">
                        {count} bài viết ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${categoryColors[category] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      {stats?.recent_posts && stats.recent_posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bài viết gần đây</CardTitle>
            <CardDescription>
              Nội dung mới được tạo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_posts.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Link href="/admin/blog">
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {(!stats || stats.total_posts === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Bắt đầu với Blog Y tế & Sức khỏe</CardTitle>
            <CardDescription>
              Hướng dẫn tạo nội dung chất lượng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">1. Tạo bài viết đầu tiên</h4>
                <p className="text-sm text-muted-foreground">
                  Bắt đầu với một bài viết về chủ đề y tế, sức khỏe hoặc thuốc
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">2. Chọn danh mục phù hợp</h4>
                <p className="text-sm text-muted-foreground">
                  Phân loại nội dung theo Y tế, Sức khỏe, hoặc Thuốc
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">3. Tối ưu SEO</h4>
                <p className="text-sm text-muted-foreground">
                  Thêm mô tả và từ khóa để tăng khả năng tìm kiếm
                </p>
              </div>
              <Link href="/admin/blog">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài viết đầu tiên
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
