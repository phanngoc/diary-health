import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    accessToken: string;
    role?: string;
    isAdmin?: boolean;
  }

  interface Session {
    user: User & {
      role?: string;
      isAdmin?: boolean;
    };
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    role?: string;
    isAdmin?: boolean;
  }
}
