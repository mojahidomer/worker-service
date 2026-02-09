import { prisma } from "../prisma";
import { hash } from "bcryptjs";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

const SKILLS = [
  "Plumbing",
  "Electrician",
  "Home Cleaning",
  "Appliance Repair",
  "Painting",
  "Carpentry",
  "HVAC Repair",
  "Roofing",
  "Landscaping",
  "Handyman",
];

const LOCATIONS = [
  { city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209, zip: "110001" },
  { city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, zip: "400001" },
  { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, zip: "560001" },
  { city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, zip: "500001" },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, zip: "600001" },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, zip: "700001" },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, zip: "411001" },
  { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, zip: "302001" },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, zip: "380001" },
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, zip: "226001" },
  { city: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, zip: "834001" },
  { city: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029, zip: "831001" },
  { city: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304, zip: "826001" },
  { city: "Hazaribagh", state: "Jharkhand", lat: 23.9966, lng: 85.3691, zip: "825301" },
  { city: "Lohardaga", state: "Jharkhand", lat: 23.4346, lng: 84.6838, zip: "835302" },
  { city: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, zip: "800001" },
];

export async function seedWorkers(count = 10000) {
  const passwordHash = await hash("Seeded@123", 10);
  const batchSize = 500;

  for (let offset = 0; offset < count; offset += batchSize) {
    const batchCount = Math.min(batchSize, count - offset);

    const addresses = [];
    const users = [];
    const workers = [];

    for (let i = 0; i < batchCount; i += 1) {
      const index = offset + i + 1;
      const location = faker.helpers.arrayElement(LOCATIONS);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const email = `worker-${randomUUID()}@localpros.com`;
      const phone = `+91-${faker.string.numeric(10)}`;
      const skills = faker.helpers.arrayElements(SKILLS, { min: 1, max: 2 });
      const experienceYears = faker.number.int({ min: 1, max: 25 });
      const pricePerService = faker.number.int({ min: 200, max: 2000 });

      const addressId = randomUUID();
      const userId = randomUUID();

      addresses.push({
        id: addressId,
        line1: faker.location.streetAddress(),
        line2: faker.datatype.boolean() ? faker.location.secondaryAddress() : null,
        area: faker.location.city(),
        city: location.city,
        state: location.state,
        country: "IN",
        pincode: location.zip,
        latitude: location.lat + faker.number.float({ min: -0.02, max: 0.02, fractionDigits: 6 }),
        longitude: location.lng + faker.number.float({ min: -0.02, max: 0.02, fractionDigits: 6 }),
      });

      users.push({
        id: userId,
        name: fullName,
        email,
        phone,
        passwordHash,
        role: "WORKER",
        addressId,
      });

      workers.push({
        id: randomUUID(),
        userId,
        name: fullName,
        phone,
        email,
        skills,
        experienceYears,
        workDescription: faker.lorem.sentences({ min: 1, max: 2 }),
        payType: faker.helpers.arrayElement(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]),
        pricePerService,
        serviceRadiusKm: faker.number.int({ min: 10, max: 60 }),
        rating: faker.number.float({ min: 3.8, max: 5, fractionDigits: 1 }),
        totalReviews: faker.number.int({ min: 5, max: 220 }),
        status: "ACTIVE",
        profileVisible: true,
        addressId,
      });
    }

    await prisma.address.createMany({ data: addresses, skipDuplicates: true });
    await prisma.user.createMany({
      data: users as Array<{ id: string; name: string; email: string; phone: string; passwordHash: string; role: "WORKER"; addressId: string }>,
      skipDuplicates: true,
    });
    await prisma.worker.createMany({
      data: workers as Array<{
        id: string;
        userId: string;
        name: string;
        phone: string;
        email: string | null;
        skills: string[];
        experienceYears: number;
        workDescription: string | null;
        payType: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
        pricePerService: number;
        serviceRadiusKm: number;
        rating: number;
        totalReviews: number;
        status: "ACTIVE";
        profileVisible: boolean;
        addressId: string;
      }>,
      skipDuplicates: true,
    });
  }
}
