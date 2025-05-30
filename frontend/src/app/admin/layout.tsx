'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Settings, FileText, Users, BarChart3, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdminGuard } from '@/hooks/useAdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: Home,
    description: 'Tổng quan hệ thống'
  },
  {
    href: '/admin/blog',
    label: 'Quản lý Blog',
    icon: FileText,
    description: 'Nội dung y tế & sức khỏe'
  },
  {
    href: '/admin/users',
    label: 'Người dùng',
    icon: Users,
    description: 'Quản lý tài khoản'
  },
  {
    href: '/admin/analytics',
    label: 'Thống kê',
    icon: BarChart3,
    description: 'Báo cáo & phân tích'
  },
  {
    href: '/admin/settings',
    label: 'Cài đặt',
    icon: Settings,
    description: 'Cấu hình hệ thống'
  }
];

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Health Reminder
            </p>
          </div>
          
          <nav className="px-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {session?.user?.email}
                  </div>
                  <div className="text-gray-600">Quản trị viên</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => router.push('/')}
                  >
                    Về trang chính
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminGuard>
  );
}
