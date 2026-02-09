import { z } from "zod";

export const accountSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  experienceYears: z.coerce.number().int().min(0, "Experience must be 0 or more").max(100, "Max 100 years"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  workDescription: z.string().max(2000).optional(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
