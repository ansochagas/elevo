import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const u = rows[0];
        if (!u) return null;
        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;
        return { id: u.id, name: u.name, email: u.email, role: u.role };
      },
    }),
  ],
});
