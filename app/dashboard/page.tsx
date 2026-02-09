import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Dashboard (USER)</h1>
      <p>Welcome, {session.user?.email ?? session.user?.name}.</p>
    </main>
  );
}
