// Login Page
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "admin@example.com",
    password: "adminpassword",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log("Login result:", result);

      if (result?.ok) {
        toast.success("Đăng nhập thành công!");
        router.push("/medications");
        // router.refresh();
      }
      // if (result?.error) {
      //   toast.error("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
      // } else {
      //   toast.success("Đăng nhập thành công!");
      //   router.push("/medications");
      //   router.refresh();
      // }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Đăng nhập để quản lý thuốc của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password">Mật khẩu</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            Chưa có tài khoản?{" "}
            <Link href="/auth/register" className="text-blue-500 hover:underline">
              Đăng ký
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
