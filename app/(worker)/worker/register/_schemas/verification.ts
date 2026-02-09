import { z } from "zod";

export const verificationSchema = z.object({
  idFront: z.any().optional(),
  idBack: z.any().optional(),
  license: z.any().optional(),
  consent: z.boolean().refine((val) => val, "Consent is required"),
});

export type VerificationFormValues = z.infer<typeof verificationSchema>;
