import { z } from 'zod';

/**
 * Studio Theme Schema
 */
export const StudioThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color'),
  font: z.string().min(1).max(50),
});

export type StudioTheme = z.infer<typeof StudioThemeSchema>;

/**
 * Studio Plan Enum
 */
export const StudioPlanSchema = z.enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']);
export type StudioPlan = z.infer<typeof StudioPlanSchema>;

/**
 * Transform JSONB from string or object
 */
const jsonbTransform = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, schema);

/**
 * Studio Schema - Full database record
 */
export const StudioSchema = z.object({
  id: z.string(),
  subdomain: z.string().min(3).max(63),
  customDomain: z.string().nullable().optional(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  logoUrl: z.string().url().nullable().optional(),
  theme: jsonbTransform(StudioThemeSchema),
  plan: StudioPlanSchema,
  maxEmployees: z.number().int().positive(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  ownerId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Studio = z.infer<typeof StudioSchema>;

/**
 * Create Studio Input Schema
 */
export const CreateStudioSchema = z.object({
  subdomain: StudioSchema.shape.subdomain,
  name: StudioSchema.shape.name,
  slug: StudioSchema.shape.slug,
  logoUrl: StudioSchema.shape.logoUrl.optional(),
  theme: StudioThemeSchema.optional(),
  plan: StudioPlanSchema.optional(),
  maxEmployees: z.number().int().positive().optional(),
  phone: StudioSchema.shape.phone.optional(),
  email: StudioSchema.shape.email.optional(),
  address: StudioSchema.shape.address.optional(),
  ownerId: StudioSchema.shape.ownerId,
});

export type CreateStudioInput = z.infer<typeof CreateStudioSchema>;

/**
 * Update Studio Input Schema
 */
export const UpdateStudioSchema = z.object({
  name: StudioSchema.shape.name.optional(),
  logoUrl: StudioSchema.shape.logoUrl.optional(),
  theme: StudioThemeSchema.optional(),
  phone: StudioSchema.shape.phone.optional(),
  email: StudioSchema.shape.email.optional(),
  address: StudioSchema.shape.address.optional(),
});

export type UpdateStudioInput = z.infer<typeof UpdateStudioSchema>;
