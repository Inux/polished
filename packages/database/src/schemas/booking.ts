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
 * Booking Status Enum
 */
export const BookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/**
 * Booking Schema - Full database record
 */
export const BookingSchema = z.object({
  id: z.string(),
  studioId: z.string(),
  serviceId: z.string(),
  employeeId: z.string(),
  customerId: z.string().nullable().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: BookingStatusSchema,
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(1).max(20),
  customerEmail: z.string().email().nullable().optional(),
  whatsappMessageId: z.string().nullable().optional(),
  whatsappStatus: z.string().nullable().optional(),
  price: z.coerce.number().positive(),
  notes: z.string().max(500).nullable().optional(),
  privateNotes: z.string().max(500).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Booking = z.infer<typeof BookingSchema>;

/**
 * Create Booking Input Schema (from customer)
 */
export const CreateBookingSchema = z.object({
  studioId: BookingSchema.shape.studioId,
  serviceId: BookingSchema.shape.serviceId,
  employeeId: BookingSchema.shape.employeeId,
  startTime: z.coerce.date(),
  customerName: BookingSchema.shape.customerName,
  customerPhone: BookingSchema.shape.customerPhone,
  customerEmail: BookingSchema.shape.customerEmail.optional(),
  notes: BookingSchema.shape.notes.optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

/**
 * Update Booking Status Input Schema
 */
export const UpdateBookingStatusSchema = z.object({
  status: BookingStatusSchema,
  privateNotes: BookingSchema.shape.privateNotes.optional(),
});

export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;

/**
 * Booking with related data (for display)
 */
export const BookingWithDetailsSchema = BookingSchema.extend({
  service: jsonbTransform(z.object({
    name: z.string(),
    category: z.string(),
  })),
  employee: jsonbTransform(z.object({
    title: z.string(),
    user: jsonbTransform(z.object({
      name: z.string(),
    })),
  })),
});

export type BookingWithDetails = z.infer<typeof BookingWithDetailsSchema>;

/**
 * Available Time Slot Schema (for booking UI)
 */
export const AvailableSlotSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  employeeId: z.string().uuid(),
  employeeName: z.string(),
});

export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;
