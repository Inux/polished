export interface LocalizedString {
  de: string;
  fr: string;
  en: string;
}

export interface ThemeConfig {
  id: string;
  cssVariables: Record<string, string>;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface WorkingHours {
  monday: TimeSlot | null;
  tuesday: TimeSlot | null;
  wednesday: TimeSlot | null;
  thursday: TimeSlot | null;
  friday: TimeSlot | null;
  saturday: TimeSlot | null;
  sunday: TimeSlot | null;
}

export interface Availability {
  defaultWorkingHours: WorkingHours;
  breaks: TimeSlot[];
}

// Duration variant with its own price
export interface ServiceVariant {
  duration: number; // minutes
  price: number;
  label?: LocalizedString; // optional label like "Quick" or "Extended"
}

// Extra/add-on option
export interface ServiceExtra {
  id: string;
  name: LocalizedString;
  price: number; // additional cost
  description?: LocalizedString;
}

export interface Service {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  currency: string;
  category: string;
  image?: string;
  featured: boolean;

  // Support for variants (multiple durations/prices)
  variants: ServiceVariant[];

  // Optional extras/add-ons
  extras?: ServiceExtra[];

  // Deprecated: kept for backwards compatibility
  duration?: number;
  price?: number;
}

export interface Category {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  comingSoon?: boolean;
}

export interface GalleryItem {
  src: string;
  alt: LocalizedString;
  category?: string;
  tags?: string[];
}

export interface Contact {
  whatsapp: string;
  email: string;
}

export interface SpecialistTranslations {
  heroTitle: LocalizedString;
  heroSubtitle: LocalizedString;
  categoriesTitle: LocalizedString;
  galleryTitle?: LocalizedString;
  portfolioTitle?: LocalizedString;
  ctaTitle: LocalizedString;
  bookLabel: LocalizedString;
  comingSoon?: LocalizedString;
}

export interface Specialist {
  id: string;
  slug: string;
  name: LocalizedString;
  title: LocalizedString;
  bio: LocalizedString;
  avatar: string;
  contact: Contact;
  theme: ThemeConfig;
  availability: Availability;
  translations: SpecialistTranslations;
  categories: Category[];
  services: Service[];
  gallery: GalleryItem[];
}

export interface Holiday {
  date: string;
  owner: string;
  type: string;
  reason: LocalizedString;
}

export interface BookingSettings {
  timezone: string;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  slotDurationMinutes: number;
  bufferBetweenSlots: number;
}
