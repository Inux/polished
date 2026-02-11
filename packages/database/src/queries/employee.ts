import { sql } from '../client';
import {
  EmployeeSchema,
  EmployeeWithUserSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  type Employee,
  type EmployeeWithUser,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from '../schemas';

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  const result = await sql`
    SELECT * FROM employees WHERE id = ${id}
  `;

  if (result.length === 0) return null;
  return EmployeeSchema.parse(result[0]);
}

/**
 * Get employee with user data
 */
export async function getEmployeeWithUser(id: string): Promise<EmployeeWithUser | null> {
  const result = await sql`
    SELECT
      e.*,
      json_build_object(
        'name', u.name,
        'email', u.email,
        'phone', u.phone
      ) as user
    FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE e.id = ${id}
  `;

  if (result.length === 0) return null;
  return EmployeeWithUserSchema.parse(result[0]);
}

/**
 * Get employees by studio ID
 */
export async function getEmployeesByStudioId(
  studioId: string,
  options?: { activeOnly?: boolean }
): Promise<EmployeeWithUser[]> {
  const activeOnly = options?.activeOnly ?? true;

  const result = await sql`
    SELECT
      e.*,
      json_build_object(
        'name', u.name,
        'email', u.email,
        'phone', u.phone
      ) as user
    FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE e.studio_id = ${studioId}
    ${activeOnly ? sql`AND e.is_active = TRUE` : sql``}
    ORDER BY u.name ASC
  `;

  return result.map((row) => EmployeeWithUserSchema.parse(row));
}

/**
 * Get employee by user ID
 */
export async function getEmployeeByUserId(userId: string): Promise<Employee | null> {
  const result = await sql`
    SELECT * FROM employees WHERE user_id = ${userId}
  `;

  if (result.length === 0) return null;
  return EmployeeSchema.parse(result[0]);
}

/**
 * Create a new employee
 */
export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const validated = CreateEmployeeSchema.parse(input);

  const defaultWorkingHours = {
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [],
    sunday: [],
  };

  const result = await sql`
    INSERT INTO employees (
      studio_id, user_id, title, bio, photo_url, working_hours, buffer_time
    ) VALUES (
      ${validated.studioId},
      ${validated.userId},
      ${validated.title},
      ${validated.bio ?? null},
      ${validated.photoUrl ?? null},
      ${JSON.stringify(validated.workingHours ?? defaultWorkingHours)},
      ${validated.bufferTime ?? 15}
    )
    RETURNING *
  `;

  return EmployeeSchema.parse(result[0]);
}

/**
 * Update employee
 */
export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<Employee> {
  const validated = UpdateEmployeeSchema.parse(input);

  const updates: Record<string, string | number | boolean | null> = {};

  if (validated.title !== undefined) updates.title = validated.title;
  if (validated.bio !== undefined) updates.bio = validated.bio;
  if (validated.photoUrl !== undefined) updates.photo_url = validated.photoUrl;
  if (validated.workingHours !== undefined) {
    updates.working_hours = JSON.stringify(validated.workingHours);
  }
  if (validated.bufferTime !== undefined) updates.buffer_time = validated.bufferTime;
  if (validated.isActive !== undefined) updates.is_active = validated.isActive;

  if (Object.keys(updates).length === 0) {
    const existing = await getEmployeeById(id);
    if (!existing) throw new Error('Employee not found');
    return existing;
  }

  const result = await sql`
    UPDATE employees
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) throw new Error('Employee not found');
  return EmployeeSchema.parse(result[0]);
}

/**
 * Deactivate employee
 */
export async function deactivateEmployee(id: string): Promise<void> {
  await sql`
    UPDATE employees SET is_active = FALSE WHERE id = ${id}
  `;
}

/**
 * Delete employee
 */
export async function deleteEmployee(id: string): Promise<void> {
  await sql`DELETE FROM employees WHERE id = ${id}`;
}
