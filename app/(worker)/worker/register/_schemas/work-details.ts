import { z } from "zod";

export const workDetailsSchema = z.object({
  experienceYears: z.coerce.number().int().min(0, "Experience must be 0 or more").max(100, "Max 100 years"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  workDescription: z.string().max(2000).optional(),
  payType: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]),
  rate: z.coerce.number().min(0, "Rate must be 0 or more"),
});

export type WorkDetailsFormValues = z.infer<typeof workDetailsSchema>;
