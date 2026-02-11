import { z } from 'zod';

/**
 * User Schema - Full database record
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string().nullable().optional(),
  name: z.string().min(1).max(100),
  phone: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * User without sensitive data (for API responses)
 */
export const UserPublicSchema = UserSchema.omit({ passwordHash: true });
export type UserPublic = z.infer<typeof UserPublicSchema>;

/**
 * Create User Input Schema
 */
export const CreateUserSchema = z.object({
  email: UserSchema.shape.email,
  password: z.string().min(8).max(100).optional(), // Will be hashed
  name: UserSchema.shape.name,
  phone: UserSchema.shape.phone.optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Update User Input Schema
 */
export const UpdateUserSchema = z.object({
  email: UserSchema.shape.email.optional(),
  name: UserSchema.shape.name.optional(),
  phone: UserSchema.shape.phone.optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Login Input Schema
 */
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;
