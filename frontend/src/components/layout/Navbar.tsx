"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/auth";
import { useEffect, useState } from "react";
import { isClientAuthenticated, removeClientToken } from "@/lib/clientAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/medications", label: "Thuốc của tôi", auth: true },
  { href: "/logs", label: "Lịch sử", auth: true },
  { href: "/alerts", label: "Cảnh báo", auth: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on client side
    setAuthenticated(isClientAuthenticated());
  }, [pathname]);

  const handleSignOut = async () => {
    // Remove token from localStorage
    removeClientToken();
    
    // Sign out from NextAuth
    await signOut({ redirect: false });
    
    // Redirect to home page
    router.push("/");
    router.refresh();
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
              .filter(item => !item.auth || (item.auth && authenticated))
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
            
            {!authenticated ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Đăng ký</Link>
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignOut} variant="outline">
                Đăng xuất
              </Button>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
} 