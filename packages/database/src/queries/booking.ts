import { sql } from '../client';
import {
  BookingSchema,
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  BookingWithDetailsSchema,
  type Booking,
  type CreateBookingInput,
  type UpdateBookingStatusInput,
  type BookingWithDetails,
  type BookingStatus,
} from '../schemas';

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const result = await sql`
    SELECT * FROM bookings WHERE id = ${id}
  `;

  if (result.length === 0) return null;
  return BookingSchema.parse(result[0]);
}

/**
 * Get booking with full details
 */
export async function getBookingWithDetails(id: string): Promise<BookingWithDetails | null> {
  const result = await sql`
    SELECT
      b.*,
      json_build_object(
        'name', s.name,
        'category', s.category
      ) as service,
      json_build_object(
        'title', e.title,
        'user', json_build_object('name', u.name)
      ) as employee
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN employees e ON b.employee_id = e.id
    JOIN users u ON e.user_id = u.id
    WHERE b.id = ${id}
  `;

  if (result.length === 0) return null;
  return BookingWithDetailsSchema.parse(result[0]);
}

/**
 * Get bookings by studio ID
 */
export async function getBookingsByStudioId(
  studioId: string,
  options?: {
    status?: BookingStatus[];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<BookingWithDetails[]> {
  const { status, startDate, endDate, limit = 50, offset = 0 } = options ?? {};

  const result = await sql`
    SELECT
      b.*,
      json_build_object(
        'name', s.name,
        'category', s.category
      ) as service,
      json_build_object(
        'title', e.title,
        'user', json_build_object('name', u.name)
      ) as employee
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN employees e ON b.employee_id = e.id
    JOIN users u ON e.user_id = u.id
    WHERE b.studio_id = ${studioId}
    ${status && status.length > 0 ? sql`AND b.status = ANY(${status})` : sql``}
    ${startDate ? sql`AND b.start_time >= ${startDate}` : sql``}
    ${endDate ? sql`AND b.start_time <= ${endDate}` : sql``}
    ORDER BY b.start_time ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return result.map((row) => BookingWithDetailsSchema.parse(row));
}

/**
 * Get bookings by employee ID
 */
export async function getBookingsByEmployeeId(
  employeeId: string,
  options?: {
    status?: BookingStatus[];
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Booking[]> {
  const { status, startDate, endDate } = options ?? {};

  const result = await sql`
    SELECT * FROM bookings
    WHERE employee_id = ${employeeId}
    ${status && status.length > 0 ? sql`AND status = ANY(${status})` : sql``}
    ${startDate ? sql`AND start_time >= ${startDate}` : sql``}
    ${endDate ? sql`AND start_time <= ${endDate}` : sql``}
    ORDER BY start_time ASC
  `;

  return result.map((row) => BookingSchema.parse(row));
}

/**
 * Get today's bookings for a studio
 */
export async function getTodaysBookings(studioId: string): Promise<BookingWithDetails[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getBookingsByStudioId(studioId, {
    startDate: today,
    endDate: tomorrow,
    status: ['PENDING', 'CONFIRMED'],
  });
}

/**
 * Get upcoming bookings for a studio
 */
export async function getUpcomingBookings(
  studioId: string,
  limit = 10
): Promise<BookingWithDetails[]> {
  return getBookingsByStudioId(studioId, {
    startDate: new Date(),
    status: ['PENDING', 'CONFIRMED'],
    limit,
  });
}

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const validated = CreateBookingSchema.parse(input);

  // Get service duration from employee_services
  const employeeService = await sql`
    SELECT duration FROM employee_services
    WHERE employee_id = ${validated.employeeId}
    AND service_id = ${validated.serviceId}
    AND is_active = TRUE
  `;

  if (employeeService.length === 0) {
    throw new Error('Service not offered by this employee');
  }

  const duration = employeeService[0].duration as number;
  const endTime = new Date(validated.startTime.getTime() + duration * 60 * 1000);

  // Get price from employee_services
  const price = await sql`
    SELECT price FROM employee_services
    WHERE employee_id = ${validated.employeeId}
    AND service_id = ${validated.serviceId}
  `;

  const result = await sql`
    INSERT INTO bookings (
      studio_id, service_id, employee_id, start_time, end_time,
      customer_name, customer_phone, customer_email, notes, price, status
    ) VALUES (
      ${validated.studioId},
      ${validated.serviceId},
      ${validated.employeeId},
      ${validated.startTime},
      ${endTime},
      ${validated.customerName},
      ${validated.customerPhone},
      ${validated.customerEmail ?? null},
      ${validated.notes ?? null},
      ${price[0].price},
      'PENDING'
    )
    RETURNING *
  `;

  return BookingSchema.parse(result[0]);
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  input: UpdateBookingStatusInput
): Promise<Booking> {
  const validated = UpdateBookingStatusSchema.parse(input);

  const updates: Record<string, string | null> = {
    status: validated.status,
  };

  if (validated.privateNotes !== undefined) {
    updates.private_notes = validated.privateNotes;
  }

  const result = await sql`
    UPDATE bookings
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) throw new Error('Booking not found');
  return BookingSchema.parse(result[0]);
}

/**
 * Check if time slot is available
 */
export async function isTimeSlotAvailable(
  employeeId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const result = await sql`
    SELECT EXISTS (
      SELECT 1 FROM bookings
      WHERE employee_id = ${employeeId}
      AND status NOT IN ('CANCELLED', 'DECLINED')
      AND tstzrange(start_time, end_time) && tstzrange(${startTime}, ${endTime})
      ${excludeBookingId ? sql`AND id != ${excludeBookingId}` : sql``}
    ) as exists
  `;

  return !result[0].exists;
}

/**
 * Get available time slots for an employee on a date
 */
export async function getAvailableSlots(
  employeeId: string,
  date: Date,
  duration: number // minutes
): Promise<{ startTime: Date; endTime: Date }[]> {
  // Get employee working hours
  const employee = await sql`
    SELECT working_hours, buffer_time FROM employees WHERE id = ${employeeId}
  `;

  if (employee.length === 0) return [];

  // Parse JSONB if it comes back as a string
  let workingHours = employee[0].workingHours;
  if (typeof workingHours === 'string') {
    try {
      workingHours = JSON.parse(workingHours);
    } catch {
      return [];
    }
  }
  workingHours = workingHours as Record<string, { start: string; end: string }[]>;
  const bufferTime = (employee[0].bufferTime as number) || 0;

  // Get day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[date.getDay()];
  const dayHours = workingHours[dayName] || [];

  if (dayHours.length === 0) return [];

  // Get existing bookings for the day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existingBookings = await sql`
    SELECT start_time, end_time FROM bookings
    WHERE employee_id = ${employeeId}
    AND status NOT IN ('CANCELLED', 'DECLINED')
    AND start_time >= ${dayStart}
    AND start_time < ${dayEnd}
    ORDER BY start_time ASC
  `;

  // Calculate available slots
  const slots: { startTime: Date; endTime: Date }[] = [];
  const slotDuration = duration + bufferTime;

  for (const hours of dayHours) {
    const [startHour, startMin] = hours.start.split(':').map(Number);
    const [endHour, endMin] = hours.end.split(':').map(Number);

    const windowStart = new Date(date);
    windowStart.setHours(startHour, startMin, 0, 0);

    const windowEnd = new Date(date);
    windowEnd.setHours(endHour, endMin, 0, 0);

    // Generate 30-minute interval slots
    let current = new Date(windowStart);

    while (current.getTime() + duration * 60 * 1000 <= windowEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + duration * 60 * 1000);

      // Check if slot conflicts with existing bookings
      const hasConflict = existingBookings.some((booking: { startTime: Date; endTime: Date }) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        // Add buffer after booking
        bookingEnd.setMinutes(bookingEnd.getMinutes() + bufferTime);

        return (
          (current >= bookingStart && current < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (current <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      // Don't show past slots
      const now = new Date();
      if (!hasConflict && current > now) {
        slots.push({
          startTime: new Date(current),
          endTime: slotEnd,
        });
      }

      // Move to next 30-minute slot
      current.setMinutes(current.getMinutes() + 30);
    }
  }

  return slots;
}

/**
 * Cancel booking
 */
export async function cancelBooking(id: string): Promise<Booking> {
  return updateBookingStatus(id, { status: 'CANCELLED' });
}

/**
 * Complete booking
 */
export async function completeBooking(id: string, privateNotes?: string): Promise<Booking> {
  return updateBookingStatus(id, { status: 'COMPLETED', privateNotes });
}
