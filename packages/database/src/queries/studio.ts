import { sql } from '../client';
import {
  StudioSchema,
  CreateStudioSchema,
  UpdateStudioSchema,
  type Studio,
  type CreateStudioInput,
  type UpdateStudioInput,
} from '../schemas';

/**
 * Get studio by ID
 */
export async function getStudioById(id: string): Promise<Studio | null> {
  const result = await sql`
    SELECT * FROM studios WHERE id = ${id}
  `;

  if (result.length === 0) return null;
  return StudioSchema.parse(result[0]);
}

/**
 * Get studio by subdomain
 */
export async function getStudioBySubdomain(subdomain: string): Promise<Studio | null> {
  const result = await sql`
    SELECT * FROM studios WHERE subdomain = ${subdomain}
  `;

  if (result.length === 0) return null;
  return StudioSchema.parse(result[0]);
}

/**
 * Get studio by custom domain
 */
export async function getStudioByCustomDomain(domain: string): Promise<Studio | null> {
  const result = await sql`
    SELECT * FROM studios WHERE custom_domain = ${domain}
  `;

  if (result.length === 0) return null;
  return StudioSchema.parse(result[0]);
}

/**
 * Get studios by owner ID
 */
export async function getStudiosByOwnerId(ownerId: string): Promise<Studio[]> {
  const result = await sql`
    SELECT * FROM studios WHERE owner_id = ${ownerId}
    ORDER BY created_at DESC
  `;

  return result.map((row) => StudioSchema.parse(row));
}

/**
 * Create a new studio
 */
export async function createStudio(input: CreateStudioInput): Promise<Studio> {
  const validated = CreateStudioSchema.parse(input);

  const result = await sql`
    INSERT INTO studios (
      subdomain, name, slug, logo_url, theme, plan, max_employees,
      phone, email, address, owner_id
    ) VALUES (
      ${validated.subdomain},
      ${validated.name},
      ${validated.slug},
      ${validated.logoUrl ?? null},
      ${JSON.stringify(validated.theme ?? { primaryColor: '#4f46e5', secondaryColor: '#10b981', font: 'Inter' })},
      ${validated.plan ?? 'TRIAL'},
      ${validated.maxEmployees ?? 5},
      ${validated.phone ?? null},
      ${validated.email ?? null},
      ${validated.address ?? null},
      ${validated.ownerId}
    )
    RETURNING *
  `;

  return StudioSchema.parse(result[0]);
}

/**
 * Update studio
 */
export async function updateStudio(id: string, input: UpdateStudioInput): Promise<Studio> {
  const validated = UpdateStudioSchema.parse(input);

  // Build dynamic update query
  const updates: string[] = [];
  const values: (string | null | object)[] = [];

  if (validated.name !== undefined) {
    updates.push('name');
    values.push(validated.name);
  }
  if (validated.logoUrl !== undefined) {
    updates.push('logo_url');
    values.push(validated.logoUrl);
  }
  if (validated.theme !== undefined) {
    updates.push('theme');
    values.push(JSON.stringify(validated.theme));
  }
  if (validated.phone !== undefined) {
    updates.push('phone');
    values.push(validated.phone);
  }
  if (validated.email !== undefined) {
    updates.push('email');
    values.push(validated.email);
  }
  if (validated.address !== undefined) {
    updates.push('address');
    values.push(validated.address);
  }

  if (updates.length === 0) {
    const existing = await getStudioById(id);
    if (!existing) throw new Error('Studio not found');
    return existing;
  }

  const result = await sql`
    UPDATE studios
    SET ${sql(Object.fromEntries(updates.map((key, i) => [key, values[i]])))}
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) throw new Error('Studio not found');
  return StudioSchema.parse(result[0]);
}

/**
 * Check if subdomain is available
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const result = await sql`
    SELECT EXISTS (
      SELECT 1 FROM studios WHERE subdomain = ${subdomain}
    ) as exists
  `;

  return !result[0].exists;
}

/**
 * Delete studio (soft delete in future, hard delete for now)
 */
export async function deleteStudio(id: string): Promise<void> {
  await sql`DELETE FROM studios WHERE id = ${id}`;
}
