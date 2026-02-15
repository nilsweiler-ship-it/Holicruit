import { z } from "zod";

export const createApplicationSchema = z.object({
  candidateId: z.string().min(1),
  roleId: z.string().min(1),
  headhunterId: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  stage: z.enum([
    "APPLIED",
    "SCREENING",
    "SHORTLISTED",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
  ]),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
