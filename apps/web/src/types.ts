/**
 * Types for landing page data
 * These match the database schemas from @polished/database
 */

export interface StudioTheme {
  primaryColor: string;
  secondaryColor: string;
  font: string;
}

export interface Studio {
  id: string;
  subdomain: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  theme: StudioTheme;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface Employee {
  id: string;
  title: string;
  bio?: string | null;
  photoUrl?: string | null;
  user: {
    name: string;
    email: string;
  };
}

export interface ServiceWithPricing {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  imageUrl?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minDuration?: number | null;
  maxDuration?: number | null;
  employeeCount: number;
}

export interface LandingPageData {
  studio: Studio;
  services: ServiceWithPricing[];
  employees: Employee[];
  categories: string[];
}
