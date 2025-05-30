'use client';

import { FileText, Eye, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogStatsProps {
  stats: {
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    archived_posts: number;
    categories: Record<string, number>;
    recent_posts: any[];
  };
}

export function BlogStats({ stats }: BlogStatsProps) {
  const statsCards = [
    {
      title: 'Tổng bài viết',
      value: stats.total_posts,
      description: 'Tất cả bài viết trong hệ thống',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Đã xuất bản',
      value: stats.published_posts,
      description: 'Bài viết công khai',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Bản nháp',
      value: stats.draft_posts,
      description: 'Đang soạn thảo',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Đã lưu trữ',
      value: stats.archived_posts,
      description: 'Không còn hiển thị',
      icon: Calendar,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  const publishedPercentage = stats.total_posts > 0 
    ? Math.round((stats.published_posts / stats.total_posts) * 100) 
    : 0;

  const draftPercentage = stats.total_posts > 0 
    ? Math.round((stats.draft_posts / stats.total_posts) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publishing Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tỉ lệ xuất bản</CardTitle>
            <CardDescription>
              Tỉ lệ bài viết đã xuất bản so với tổng số bài viết
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Đã xuất bản</span>
                <span className="font-medium">{publishedPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${publishedPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.published_posts} / {stats.total_posts} bài viết
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Draft Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bài viết đang soạn thảo</CardTitle>
            <CardDescription>
              Tỉ lệ bài viết chưa hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Bản nháp</span>
                <span className="font-medium">{draftPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all"
                  style={{ width: `${draftPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.draft_posts} / {stats.total_posts} bài viết
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phân bố theo danh mục</CardTitle>
          <CardDescription>
            Số lượng bài viết trong mỗi danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.categories).map(([category, count]) => {
              const categoryLabels: Record<string, string> = {
                'y-te': 'Y tế',
                'suc-khoe': 'Sức khỏe',
                'thuoc': 'Thuốc'
              };
              
              const categoryColors: Record<string, string> = {
                'y-te': 'bg-blue-600',
                'suc-khoe': 'bg-green-600',
                'thuoc': 'bg-purple-600'
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
                      className={`h-2 rounded-full transition-all ${categoryColors[category] || 'bg-gray-600'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
