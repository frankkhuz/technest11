import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://technestbackend-gue0.onrender.com";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        try {
          const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();

          // data should contain { token, user: { id, name, email, role } }
          if (data?.token && data?.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role, // "user" | "vendor" | "admin"
              backendToken: data.token, // Store the Express JWT
            };
          }

          return null;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Persist role + backend token into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.backendToken = user.backendToken;
        token.id = user.id;
      }
      return token;
    },

    // Expose role + backend token to the client session
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.backendToken = token.backendToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days — matches your backend token expiry
  },

  secret: process.env.NEXTAUTH_SECRET,
};
