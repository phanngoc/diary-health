import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import { SessionProvider } from "@/providers/SessionProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
});

export const metadata: Metadata = {
  title: "Health Reminder",
  description: "Ứng dụng ghi chú thuốc thông minh với AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background", inter.className)}>
        <SessionProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Toaster position="top-right" richColors />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
