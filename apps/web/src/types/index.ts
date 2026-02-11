/**
 * Frontend Types for Polished Web App
 */

// Studio
export interface StudioTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  logoUrl?: string;
}

export interface Studio {
  id: string;
  name: string;
  subdomain: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  theme: StudioTheme;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'STUDIO_OWNER' | 'EMPLOYEE' | 'CUSTOMER';
  createdAt: Date;
  updatedAt: Date;
}

// Employee
export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
  } | null;
}

export interface Employee {
  id: string;
  studioId: string;
  userId: string;
  title: string;
  bio?: string | null;
  photoUrl?: string | null;
  workingHours: WorkingHours;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

// Service
export interface Service {
  id: string;
  studioId: string;
  name: string;
  description?: string | null;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Service with pricing aggregates
export interface ServiceWithPricing extends Service {
  minPrice: number | null;
  maxPrice: number | null;
  minDuration: number | null;
  maxDuration: number | null;
  employeeCount: number;
}

// Booking
export interface Booking {
  id: string;
  studioId: string;
  serviceId: string;
  employeeId: string;
  customerId?: string | null;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'DECLINED';
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  notes?: string | null;
  price?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface StudioData {
  studio: Studio;
  employees: Employee[];
  services: ServiceWithPricing[];
  categories: string[];
}

export interface AvailableSlotsResponse {
  slots: string[];
  duration: number;
  price: number;
}

export interface EmployeeServiceResponse {
  employees: {
    employeeId: string;
    serviceId: string;
    price: number;
    duration: number;
  }[];
}

export interface BookingResponse {
  booking: Booking & {
    service?: Service;
    employee?: Employee;
  };
}
