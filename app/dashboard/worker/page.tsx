import { auth } from "@/auth";

export default async function DashboardWorkerPage() {
  const session = await auth();
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Worker dashboard</h1>
      <p>Welcome, {session?.user?.email ?? session?.user?.name}. (WORKER only)</p>
    </main>
  );
}
