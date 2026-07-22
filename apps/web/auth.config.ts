import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "./lib/db/schema";

/**
 * Config edge-safe (sem banco/bcrypt) — usada pelo middleware.
 * O provider de credenciais (com banco) entra só no auth.ts.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as { role?: UserRole; uid?: string };
      if (session.user) {
        session.user.role = t.role ?? "athlete";
        session.user.id = t.uid ?? session.user.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
