import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Admin</h1>
      <p>Welcome, {session.user?.email ?? session.user?.name}.</p>
    </main>
  );
}
