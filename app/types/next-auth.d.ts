import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: string;
    backendToken: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
    };
    backendToken: string; // The Express JWT — use this for API calls
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    backendToken: string;
    id: string;
  }
}
