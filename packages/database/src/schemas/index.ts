/**
 * Zod Schemas for Polished Database
 *
 * All schemas provide:
 * - Runtime validation
 * - TypeScript type inference
 * - Input validation for API
 */

// Studio schemas
export {
  StudioThemeSchema,
  StudioPlanSchema,
  StudioSchema,
  CreateStudioSchema,
  UpdateStudioSchema,
  type StudioTheme,
  type StudioPlan,
  type Studio,
  type CreateStudioInput,
  type UpdateStudioInput,
} from './studio';

// User schemas
export {
  UserSchema,
  UserPublicSchema,
  CreateUserSchema,
  UpdateUserSchema,
  LoginSchema,
  type User,
  type UserPublic,
  type CreateUserInput,
  type UpdateUserInput,
  type LoginInput,
} from './user';

// Employee schemas
export {
  TimeSlotSchema,
  WorkingHoursSchema,
  EmployeeSchema,
  EmployeeWithUserSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  type TimeSlot,
  type WorkingHours,
  type Employee,
  type EmployeeWithUser,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from './employee';

// Service schemas
export {
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
} from './service';

// Booking schemas
export {
  BookingStatusSchema,
  BookingSchema,
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  BookingWithDetailsSchema,
  AvailableSlotSchema,
  type BookingStatus,
  type Booking,
  type CreateBookingInput,
  type UpdateBookingStatusInput,
  type BookingWithDetails,
  type AvailableSlot,
} from './booking';
