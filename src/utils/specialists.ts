import type { Specialist, Holiday, BookingSettings } from '../types/specialist';

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
