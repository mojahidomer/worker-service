import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  loginId: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  WORKER: "/dashboard/worker",
  USER: "/dashboard",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        loginId: {
          label: "Email or Phone",
          type: "text",
          placeholder: "you@example.com or +1234567890",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "••••••••",
        },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { loginId, password } = parsed.data;

        const isEmail = loginId.includes("@");
        const user = isEmail
          ? await prisma.user.findUnique({ where: { email: loginId } })
          : await prisma.user.findUnique({ where: { phone: loginId } });

        if (!user?.passwordHash) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.id) {
        token.id = user.id;
        token.role = (user as User & { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        if (typeof token.id === "string") session.user.id = token.id;
        (session.user as User & { role?: string }).role = (token.role as "USER" | "WORKER" | "ADMIN") ?? "USER";
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
