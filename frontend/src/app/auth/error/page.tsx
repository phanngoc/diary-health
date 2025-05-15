// Auth Error Page
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ERROR_MESSAGES: Record<string, string> = {
  default: "Đã xảy ra lỗi xác thực.",
  CredentialsSignin: "Tên đăng nhập hoặc mật khẩu không đúng.",
  SessionRequired: "Bạn cần đăng nhập để truy cập trang này.",
  AccessDenied: "Bạn không có quyền truy cập trang này.",
};

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "default";
  const errorMessage = ERROR_MESSAGES[error] || ERROR_MESSAGES.default;

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-500">
            Lỗi xác thực
          </CardTitle>
          <CardDescription className="text-center">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button asChild className="mt-4">
            <Link href="/auth/login">Quay lại trang đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
