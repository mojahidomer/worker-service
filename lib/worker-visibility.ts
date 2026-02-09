import type { Prisma } from "@prisma/client";

/**
 * Worker is visible IF:
 * - status = ACTIVE
 * - subscription not expired (at least one WorkerSubscription with status ACTIVE and endDate >= now)
 */
export function visibleWorkerWhere(): Prisma.WorkerWhereInput {
  const now = new Date();
  return {
    status: "ACTIVE",
    subscriptions: {
      some: {
        status: "ACTIVE",
        endDate: { gte: now },
      },
    },
  };
}

/**
 * Type-safe check: is this worker visible (ACTIVE + has active, non-expired subscription)?
 * Pass a worker with `subscriptions` included (at least id, status, endDate).
 */
export function isWorkerVisible(worker: {
  status: string;
  subscriptions: Array<{ status: string; endDate: Date }>;
}): boolean {
  if (worker.status !== "ACTIVE") return false;
  const now = new Date();
  return worker.subscriptions.some(
    (s) => s.status === "ACTIVE" && s.endDate >= now
  );
}
