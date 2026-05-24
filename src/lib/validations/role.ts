import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.number().min(1).max(5),
  weight: z.number().min(0).max(100).optional(),
  required: z.boolean().optional(),
});

export const roleWeightsSchema = z.object({
  hardSkills: z.number().min(0).max(100),
  softSkills: z.number().min(0).max(100),
  experience: z.number().min(0).max(100),
  education: z.number().min(0).max(100),
});

export const createRoleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  roleType: z.enum(["PERMANENT", "CONTRACT_SHORT", "CONTRACT_MEDIUM", "CONTRACT_LONG", "PROJECT"]).default("PERMANENT"),
  bounty: z.number().int().min(0).optional(),
  contractStart: z.string().optional(),
  contractEnd: z.string().optional(),
  rateAmount: z.number().int().min(0).optional(),
  rateType: z.enum(["HOURLY", "DAILY"]).optional(),
  hardSkills: z.array(skillSchema).min(1, "At least one hard skill is required"),
  softSkills: z.array(skillSchema),
  weights: roleWeightsSchema,
  threshold: z.number().min(0).max(100).default(70),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("DRAFT"),
});

export const updateRoleSchema = createRoleSchema.partial();

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
