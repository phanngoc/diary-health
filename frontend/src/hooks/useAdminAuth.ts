"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Hook to validate admin access
export function useAdminAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = !!session;
  const isAdmin = session?.user?.isAdmin && session?.user?.role === "admin";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/auth/login?error=admin_required");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  return {
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    user: session?.user,
  };
}

// Hook for admin API calls
export function useAdminAPI() {
  const { session } = useAdminAuth();

  const adminFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api/admin${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  return {
    adminFetch,
    isAdmin: session?.user?.isAdmin,
  };
}

// Component wrapper for admin routes
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAdmin } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will be redirected by useAdminAuth
  }

  return <>{children}</>;
}
