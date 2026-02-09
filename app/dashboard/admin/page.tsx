import { auth } from "@/auth";

export default async function DashboardAdminPage() {
  const session = await auth();
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Admin dashboard</h1>
      <p>Welcome, {session?.user?.email ?? session?.user?.name}. (ADMIN only)</p>
    </main>
  );
}
