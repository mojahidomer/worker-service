import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE_REDIRECT } from "@/auth";

export default async function AuthCallbackPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role ?? "USER";
  const path = ROLE_REDIRECT[role] ?? ROLE_REDIRECT.USER;
  redirect(path);
}
