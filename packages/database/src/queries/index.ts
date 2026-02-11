/**
 * Type-safe Query Functions for Polished Database
 *
 * All queries use direct SQL with Zod validation for type safety.
 */

// Studio queries
export {
  getStudioById,
  getStudioBySubdomain,
  getStudioByCustomDomain,
  getStudiosByOwnerId,
  createStudio,
  updateStudio,
  isSubdomainAvailable,
  deleteStudio,
} from './studio';

// User queries
export {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  updateUserPassword,
  isEmailAvailable,
  deleteUser,
} from './user';

// Employee queries
export {
  getEmployeeById,
  getEmployeeWithUser,
  getEmployeesByStudioId,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  deleteEmployee,
} from './employee';

// Service queries
export {
  getServiceById,
  getServicesByStudioId,
  getServicesWithPricing,
  getServicesByCategory,
  getServiceCategories,
  createService,
  updateService,
  deleteService,
  getEmployeeService,
  getEmployeeServices,
  getEmployeesForService,
  assignServiceToEmployee,
  removeServiceFromEmployee,
} from './service';

// Booking queries
export {
  getBookingById,
  getBookingWithDetails,
  getBookingsByStudioId,
  getBookingsByEmployeeId,
  getTodaysBookings,
  getUpcomingBookings,
  createBooking,
  updateBookingStatus,
  isTimeSlotAvailable,
  getAvailableSlots,
  cancelBooking,
  completeBooking,
} from './booking';
