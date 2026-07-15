import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

/**
 * NextAuth config — admin-only auth.
 *
 * No public user accounts exist. Only the family moderator(s) seeded in the
 * AdminUser table can sign in. The session is checked by middleware on
 * /admin/dashboard and by every admin API route handler.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Family Moderator",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [admin] = await sql`
          SELECT id, email, password, name
          FROM admin_user
          WHERE email = ${credentials.email.toLowerCase().trim()}
        `;
        if (!admin) return null;

        const valid = await bcrypt.compare(credentials.password, admin.password);
        if (!valid) return null;

        return { id: admin.id, email: admin.email, name: admin.name ?? undefined };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hour session
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

export type AdminSession = {
  user: { id: string; email: string; name?: string | null };
} | null;
