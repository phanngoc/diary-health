import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Admin credentials provider for admin panel access
const AdminCredentialsProvider = CredentialsProvider({
  id: "admin",
  name: "Admin Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    try {
      const res = await fetch(`${process.env.ADMIN_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials?.email || "",
          password: credentials?.password || "",
        }),
      });

      if (!res.ok) {
        console.error("Admin auth failed:", res.status);
        return null;
      }

      const result = await res.json();

      // Validate that user has admin role
      if (!result.user.role || result.user.role !== 'admin') {
        console.error("User does not have admin role:", result.user.role);
        return null;
      }

      return {
        id: result.user.id,
        email: result.user.email,
        name: `${result.user.firstName} ${result.user.lastName}`,
        role: result.user.role,
        accessToken: result.access_token,
        isAdmin: true,
      };
    } catch (error) {
      console.error("Admin auth error:", error);
      return null;
    }
  },
});

// Regular user credentials provider
const UserCredentialsProvider = CredentialsProvider({
  id: "user", 
  name: "User Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials?.email || "",
          password: credentials?.password || "",
        }),
      });

      if (!res.ok) {
        console.error("User auth failed:", res.status);
        return null;
      }

      const result = await res.json();

      return {
        id: result.user.id,
        email: result.user.email,
        name: result.user.full_name,
        accessToken: result.access_token,
        isAdmin: false,
      };
    } catch (error) {
      console.error("User auth error:", error);
      return null;
    }
  },
});

// Make sure NextAuth config doesn't try to use headers() in a client component
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [AdminCredentialsProvider, UserCredentialsProvider],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.user.role = token.role as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
});
