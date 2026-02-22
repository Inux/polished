import type {
  Specialist,
  Holiday,
  BookingSettings,
  Service,
  ServiceVariant,
} from '../types/specialist';

import massageWellnessData from '../data/specialists/massage-wellness.json';
import nailArtData from '../data/specialists/nail-art.json';
import holidaysData from '../data/holidays.json';

const specialists: Specialist[] = [
  massageWellnessData as Specialist,
  nailArtData as Specialist,
];

export function getAllSpecialists(): Specialist[] {
  return specialists;
}

export function getSpecialistBySlug(slug: string): Specialist | undefined {
  return specialists.find((s) => s.slug === slug);
}

export function getSpecialistById(id: string): Specialist | undefined {
  return specialists.find((s) => s.id === id);
}

export function getHolidays(): Holiday[] {
  return holidaysData.exceptions as Holiday[];
}

export function getBookingSettings(): BookingSettings {
  return {
    timezone: holidaysData.timezone,
    ...holidaysData.bookingSettings,
  };
}

export function generateThemeStyles(specialist: Specialist): string {
  return Object.entries(specialist.theme.cssVariables)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

// Service variant helpers

/**
 * Get service variants, falling back to legacy duration/price if variants not defined
 */
export function getServiceVariants(service: Service): ServiceVariant[] {
  if (service.variants && service.variants.length > 0) {
    return service.variants;
  }
  // Fallback for legacy services with single duration/price
  if (service.duration !== undefined && service.price !== undefined) {
    return [{ duration: service.duration, price: service.price }];
  }
  return [];
}

/**
 * Get the minimum price from all service variants
 */
export function getServiceMinPrice(service: Service): number {
  const variants = getServiceVariants(service);
  if (variants.length === 0) return 0;
  return Math.min(...variants.map((v) => v.price));
}

/**
 * Get the maximum price from all service variants
 */
export function getServiceMaxPrice(service: Service): number {
  const variants = getServiceVariants(service);
  if (variants.length === 0) return 0;
  return Math.max(...variants.map((v) => v.price));
}

/**
 * Check if service has multiple price variants
 */
export function hasMultipleVariants(service: Service): boolean {
  return getServiceVariants(service).length > 1;
}

/**
 * Get the minimum duration from all service variants
 */
export function getServiceMinDuration(service: Service): number {
  const variants = getServiceVariants(service);
  if (variants.length === 0) return 0;
  return Math.min(...variants.map((v) => v.duration));
}

/**
 * Calculate total price for a service with selected extras
 */
export function calculateTotalPrice(
  service: Service,
  variantIndex: number,
  selectedExtraIds: string[]
): number {
  const variants = getServiceVariants(service);
  const basePrice = variants[variantIndex]?.price || 0;
  const extrasTotal =
    service.extras
      ?.filter((e) => selectedExtraIds.includes(e.id))
      .reduce((sum, e) => sum + e.price, 0) || 0;
  return basePrice + extrasTotal;
}
