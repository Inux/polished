import de from './de.json';
import fr from './fr.json';
import en from './en.json';

export type Locale = 'de' | 'fr' | 'en';

export const defaultLocale: Locale = 'de';

export const locales: Locale[] = ['de', 'fr', 'en'];

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  fr: 'Francais',
  en: 'English',
};

const translations: Record<Locale, typeof de> = {
  de,
  fr,
  en,
};

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale] || translations[defaultLocale];
}

export function t(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[locale] || translations[defaultLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function getLocalizedValue<T>(
  value: T | Record<Locale, T>,
  locale: Locale
): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const localized = value as Record<Locale, T>;
    if (locale in localized) {
      return localized[locale];
    }
    if (defaultLocale in localized) {
      return localized[defaultLocale];
    }
  }
  return value as T;
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (locales.includes(lang as Locale)) {
    return lang as Locale;
  }
  return defaultLocale;
}

export function getLocalizedUrl(url: URL, locale: Locale): string {
  const [, currentLang, ...rest] = url.pathname.split('/');
  const isLocalized = locales.includes(currentLang as Locale);
  const path = isLocalized ? rest.join('/') : [currentLang, ...rest].join('/');

  if (locale === defaultLocale) {
    return `/${path}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  return `/${locale}/${path}`.replace(/\/+/g, '/').replace(/\/$/, '') || `/${locale}`;
}
