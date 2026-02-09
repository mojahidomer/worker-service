import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
  adapter: PrismaAdapter(prisma),
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
    async jwt({ token, user }: { token: { id?: string; role?: string }; user?: { id: string; role: string } }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: { user?: { id?: string; role?: string } };
      token: { id?: string; role?: string };
    }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as "USER" | "WORKER" | "ADMIN";
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
