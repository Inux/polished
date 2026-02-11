import { z } from 'zod';

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
 * Time Slot Schema (for working hours)
 */
export const TimeSlotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'),
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;

/**
 * Working Hours Schema (per day)
 */
export const WorkingHoursSchema = z.object({
  monday: z.array(TimeSlotSchema),
  tuesday: z.array(TimeSlotSchema),
  wednesday: z.array(TimeSlotSchema),
  thursday: z.array(TimeSlotSchema),
  friday: z.array(TimeSlotSchema),
  saturday: z.array(TimeSlotSchema),
  sunday: z.array(TimeSlotSchema),
});

export type WorkingHours = z.infer<typeof WorkingHoursSchema>;

/**
 * Employee Schema - Full database record
 */
export const EmployeeSchema = z.object({
  id: z.string(),
  studioId: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100),
  bio: z.string().max(500).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  workingHours: jsonbTransform(WorkingHoursSchema),
  bufferTime: z.number().int().min(0).max(60),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

/**
 * Employee with User data (for display)
 */
export const EmployeeWithUserSchema = EmployeeSchema.extend({
  user: jsonbTransform(z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
  })),
});

export type EmployeeWithUser = z.infer<typeof EmployeeWithUserSchema>;

/**
 * Create Employee Input Schema
 */
export const CreateEmployeeSchema = z.object({
  studioId: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100),
  bio: z.string().max(500).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  workingHours: WorkingHoursSchema.optional(),
  bufferTime: z.number().int().min(0).max(60).optional(),
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;

/**
 * Update Employee Input Schema
 */
export const UpdateEmployeeSchema = z.object({
  title: EmployeeSchema.shape.title.optional(),
  bio: EmployeeSchema.shape.bio.optional(),
  photoUrl: EmployeeSchema.shape.photoUrl.optional(),
  workingHours: WorkingHoursSchema.optional(),
  bufferTime: EmployeeSchema.shape.bufferTime.optional(),
  isActive: EmployeeSchema.shape.isActive.optional(),
});

export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
