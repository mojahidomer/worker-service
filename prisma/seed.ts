import { seedWorkers } from "../lib/seed/workerSeed";
import { seedServiceTypes } from "../lib/seed/serviceSeed";

async function main() {
  await seedServiceTypes();
  await seedWorkers();
}

main()
  .then(() => {
    console.log("Seed complete");
  })
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma client disconnect handled in the shared prisma instance
  });
