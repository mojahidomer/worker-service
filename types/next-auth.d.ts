import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "WORKER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "WORKER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "WORKER" | "ADMIN";
  }
}
