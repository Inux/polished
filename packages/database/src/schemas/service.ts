import { z } from 'zod';

/**
 * Service Schema - Full database record
 */
export const ServiceSchema = z.object({
  id: z.string(),
  studioId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  category: z.string().min(1).max(50),
  imageUrl: z.string().url().nullable().optional(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Service = z.infer<typeof ServiceSchema>;

/**
 * Create Service Input Schema
 */
export const CreateServiceSchema = z.object({
  studioId: ServiceSchema.shape.studioId,
  name: ServiceSchema.shape.name,
  description: ServiceSchema.shape.description.optional(),
  category: ServiceSchema.shape.category,
  imageUrl: ServiceSchema.shape.imageUrl.optional(),
  displayOrder: ServiceSchema.shape.displayOrder.optional(),
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;

/**
 * Update Service Input Schema
 */
export const UpdateServiceSchema = z.object({
  name: ServiceSchema.shape.name.optional(),
  description: ServiceSchema.shape.description.optional(),
  category: ServiceSchema.shape.category.optional(),
  imageUrl: ServiceSchema.shape.imageUrl.optional(),
  displayOrder: ServiceSchema.shape.displayOrder.optional(),
  isActive: ServiceSchema.shape.isActive.optional(),
});

export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;

/**
 * Employee Service (junction) Schema
 */
export const EmployeeServiceSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  serviceId: z.string(),
  price: z.coerce.number().positive(),
  duration: z.number().int().positive(), // minutes
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type EmployeeService = z.infer<typeof EmployeeServiceSchema>;

/**
 * Create Employee Service Input Schema
 */
export const CreateEmployeeServiceSchema = z.object({
  employeeId: EmployeeServiceSchema.shape.employeeId,
  serviceId: EmployeeServiceSchema.shape.serviceId,
  price: EmployeeServiceSchema.shape.price,
  duration: EmployeeServiceSchema.shape.duration,
});

export type CreateEmployeeServiceInput = z.infer<typeof CreateEmployeeServiceSchema>;

/**
 * Service with pricing info (for landing page display)
 */
export const ServiceWithPricingSchema = ServiceSchema.extend({
  minPrice: z.coerce.number().positive().nullable().optional(),
  maxPrice: z.coerce.number().positive().nullable().optional(),
  minDuration: z.coerce.number().int().positive().nullable().optional(),
  maxDuration: z.coerce.number().int().positive().nullable().optional(),
  employeeCount: z.coerce.number().int().min(0),
});

export type ServiceWithPricing = z.infer<typeof ServiceWithPricingSchema>;
