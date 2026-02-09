import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function WorkerPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "WORKER" && session.user?.role !== "ADMIN") redirect("/dashboard");
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Worker area</h1>
      <p>Welcome, {session.user?.email ?? session.user?.name}.</p>
    </main>
  );
}
