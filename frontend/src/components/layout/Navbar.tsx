"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/medications", label: "Thuốc của tôi", auth: true },
  { href: "/logs", label: "Lịch sử", auth: true },
  { href: "/alerts", label: "Cảnh báo", auth: true },
  { href: "/admin", label: "Quản trị", auth: true, admin: true },
  { href: "/admin/blog", label: "Quản lý Blog", auth: true, admin: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    // Sign out from NextAuth
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Health Reminder</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            {navItems
              .filter((item) => {
                // Show non-auth items to everyone
                if (!item.auth) return true;
                // Show auth items only to authenticated users
                if (item.auth && !session) return false;
                // Show admin items only to admin users
                if (item.admin && (!session || !session.user?.isAdmin)) return false;
                return true;
              })
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}

            {!session ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Đăng ký</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Xin chào, {session.user?.email}
                  {session.user?.isAdmin && " (Admin)"}
                </span>
                <Button onClick={handleSignOut} variant="outline">
                  Đăng xuất
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}