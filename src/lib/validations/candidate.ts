import { z } from "zod";

export const candidateSkillSchema = z.object({
  name: z.string().min(1),
  level: z.number().min(1).max(5),
  category: z.string().optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  years: z.number().min(0),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.number().min(1900).max(2030),
});

export const preferencesSchema = z.object({
  locations: z.array(z.string()).optional(),
  remote: z.boolean().optional(),
  salary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

export const updateProfileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(candidateSkillSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  preferences: preferencesSchema.optional(),
  visibility: z.enum(["ACTIVE", "PASSIVE", "HIDDEN"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
