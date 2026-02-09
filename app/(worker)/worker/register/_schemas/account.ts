import { z } from "zod";

export const accountSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
