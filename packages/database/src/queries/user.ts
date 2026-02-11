import { sql } from '../client';
import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
} from '../schemas';

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;

  if (result.length === 0) return null;
  return UserSchema.parse(result[0]);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase()}
  `;

  if (result.length === 0) return null;
  return UserSchema.parse(result[0]);
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput, passwordHash?: string): Promise<User> {
  const validated = CreateUserSchema.parse(input);

  const result = await sql`
    INSERT INTO users (email, password_hash, name, phone)
    VALUES (
      ${validated.email.toLowerCase()},
      ${passwordHash ?? null},
      ${validated.name},
      ${validated.phone ?? null}
    )
    RETURNING *
  `;

  return UserSchema.parse(result[0]);
}

/**
 * Update user
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const validated = UpdateUserSchema.parse(input);

  const updates: Record<string, string | null> = {};

  if (validated.email !== undefined) {
    updates.email = validated.email.toLowerCase();
  }
  if (validated.name !== undefined) {
    updates.name = validated.name;
  }
  if (validated.phone !== undefined) {
    updates.phone = validated.phone;
  }

  if (Object.keys(updates).length === 0) {
    const existing = await getUserById(id);
    if (!existing) throw new Error('User not found');
    return existing;
  }

  const result = await sql`
    UPDATE users
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) throw new Error('User not found');
  return UserSchema.parse(result[0]);
}

/**
 * Update user password hash
 */
export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id = ${id}
  `;
}

/**
 * Check if email is available
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const result = await sql`
    SELECT EXISTS (
      SELECT 1 FROM users WHERE email = ${email.toLowerCase()}
    ) as exists
  `;

  return !result[0].exists;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  await sql`DELETE FROM users WHERE id = ${id}`;
}
