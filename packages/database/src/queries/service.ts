import { sql } from '../client';
import {
  ServiceSchema,
  CreateServiceSchema,
  UpdateServiceSchema,
  EmployeeServiceSchema,
  CreateEmployeeServiceSchema,
  ServiceWithPricingSchema,
  type Service,
  type CreateServiceInput,
  type UpdateServiceInput,
  type EmployeeService,
  type CreateEmployeeServiceInput,
  type ServiceWithPricing,
} from '../schemas';

/**
 * Get service by ID
 */
export async function getServiceById(id: string): Promise<Service | null> {
  const result = await sql`
    SELECT * FROM services WHERE id = ${id}
  `;

  if (result.length === 0) return null;
  return ServiceSchema.parse(result[0]);
}

/**
 * Get services by studio ID
 */
export async function getServicesByStudioId(
  studioId: string,
  options?: { activeOnly?: boolean }
): Promise<Service[]> {
  const activeOnly = options?.activeOnly ?? true;

  const result = await sql`
    SELECT * FROM services
    WHERE studio_id = ${studioId}
    ${activeOnly ? sql`AND is_active = TRUE` : sql``}
    ORDER BY display_order ASC, name ASC
  `;

  return result.map((row) => ServiceSchema.parse(row));
}

/**
 * Get services with pricing info (for landing page)
 */
export async function getServicesWithPricing(studioId: string): Promise<ServiceWithPricing[]> {
  const result = await sql`
    SELECT
      s.*,
      MIN(es.price) as min_price,
      MAX(es.price) as max_price,
      MIN(es.duration) as min_duration,
      MAX(es.duration) as max_duration,
      COUNT(DISTINCT es.employee_id)::int as employee_count
    FROM services s
    LEFT JOIN employee_services es ON s.id = es.service_id AND es.is_active = TRUE
    WHERE s.studio_id = ${studioId} AND s.is_active = TRUE
    GROUP BY s.id
    ORDER BY s.display_order ASC, s.name ASC
  `;

  return result.map((row) => ServiceWithPricingSchema.parse(row));
}

/**
 * Get services by category
 */
export async function getServicesByCategory(
  studioId: string,
  category: string
): Promise<Service[]> {
  const result = await sql`
    SELECT * FROM services
    WHERE studio_id = ${studioId}
    AND category = ${category}
    AND is_active = TRUE
    ORDER BY display_order ASC, name ASC
  `;

  return result.map((row) => ServiceSchema.parse(row));
}

/**
 * Get unique categories for a studio
 */
export async function getServiceCategories(studioId: string): Promise<string[]> {
  const result = await sql`
    SELECT DISTINCT category FROM services
    WHERE studio_id = ${studioId} AND is_active = TRUE
    ORDER BY category ASC
  `;

  return result.map((row) => row.category as string);
}

/**
 * Create a new service
 */
export async function createService(input: CreateServiceInput): Promise<Service> {
  const validated = CreateServiceSchema.parse(input);

  const result = await sql`
    INSERT INTO services (
      studio_id, name, description, category, image_url, display_order
    ) VALUES (
      ${validated.studioId},
      ${validated.name},
      ${validated.description ?? null},
      ${validated.category},
      ${validated.imageUrl ?? null},
      ${validated.displayOrder ?? 0}
    )
    RETURNING *
  `;

  return ServiceSchema.parse(result[0]);
}

/**
 * Update service
 */
export async function updateService(id: string, input: UpdateServiceInput): Promise<Service> {
  const validated = UpdateServiceSchema.parse(input);

  const updates: Record<string, string | number | boolean | null> = {};

  if (validated.name !== undefined) updates.name = validated.name;
  if (validated.description !== undefined) updates.description = validated.description;
  if (validated.category !== undefined) updates.category = validated.category;
  if (validated.imageUrl !== undefined) updates.image_url = validated.imageUrl;
  if (validated.displayOrder !== undefined) updates.display_order = validated.displayOrder;
  if (validated.isActive !== undefined) updates.is_active = validated.isActive;

  if (Object.keys(updates).length === 0) {
    const existing = await getServiceById(id);
    if (!existing) throw new Error('Service not found');
    return existing;
  }

  const result = await sql`
    UPDATE services
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) throw new Error('Service not found');
  return ServiceSchema.parse(result[0]);
}

/**
 * Delete service
 */
export async function deleteService(id: string): Promise<void> {
  await sql`DELETE FROM services WHERE id = ${id}`;
}

// ============================================================================
// Employee Services (Junction table)
// ============================================================================

/**
 * Get employee service
 */
export async function getEmployeeService(
  employeeId: string,
  serviceId: string
): Promise<EmployeeService | null> {
  const result = await sql`
    SELECT * FROM employee_services
    WHERE employee_id = ${employeeId} AND service_id = ${serviceId}
  `;

  if (result.length === 0) return null;
  return EmployeeServiceSchema.parse(result[0]);
}

/**
 * Get services offered by an employee
 */
export async function getEmployeeServices(employeeId: string): Promise<EmployeeService[]> {
  const result = await sql`
    SELECT * FROM employee_services
    WHERE employee_id = ${employeeId} AND is_active = TRUE
  `;

  return result.map((row) => EmployeeServiceSchema.parse(row));
}

/**
 * Get employees offering a service
 */
export async function getEmployeesForService(serviceId: string): Promise<EmployeeService[]> {
  const result = await sql`
    SELECT * FROM employee_services
    WHERE service_id = ${serviceId} AND is_active = TRUE
  `;

  return result.map((row) => EmployeeServiceSchema.parse(row));
}

/**
 * Assign service to employee with pricing
 */
export async function assignServiceToEmployee(
  input: CreateEmployeeServiceInput
): Promise<EmployeeService> {
  const validated = CreateEmployeeServiceSchema.parse(input);

  const result = await sql`
    INSERT INTO employee_services (employee_id, service_id, price, duration)
    VALUES (
      ${validated.employeeId},
      ${validated.serviceId},
      ${validated.price},
      ${validated.duration}
    )
    ON CONFLICT (employee_id, service_id)
    DO UPDATE SET
      price = ${validated.price},
      duration = ${validated.duration},
      is_active = TRUE
    RETURNING *
  `;

  return EmployeeServiceSchema.parse(result[0]);
}

/**
 * Remove service from employee
 */
export async function removeServiceFromEmployee(
  employeeId: string,
  serviceId: string
): Promise<void> {
  await sql`
    UPDATE employee_services
    SET is_active = FALSE
    WHERE employee_id = ${employeeId} AND service_id = ${serviceId}
  `;
}
