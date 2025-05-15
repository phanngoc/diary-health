// Protected layout for authenticated routes
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    // Redirect to login if not authenticated
    redirect("/auth/login");
  }

  return <>{children}</>;
}
