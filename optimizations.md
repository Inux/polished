# Optimizations

This document tracks optimizations for the Polished Beauty & Wellness Studio website. Items marked with ✅ have been implemented.

---

## 1. Security

### 1.1 Environment Variables ✅

**Status:** Implemented

- `.env` is in `.gitignore`
- `.env.example` created with placeholder values

### 1.2 Content Security Policy ✅

**Status:** Implemented in `src/middleware.ts`

Security headers added:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` for camera, microphone, geolocation
- Content Security Policy (CSP)

### 1.3 External Link Security ✅

**Status:** Implemented

- All external links use `rel="noopener noreferrer"` with `target="_blank"`
- WhatsApp URLs properly encoded

### 1.4 Input Sanitization ✅

**Status:** Implemented

- Date inputs validated with min/max constraints
- URL parameters properly encoded using `encodeURIComponent()`

### 1.5 Rate Limiting Awareness

**Status:** Not implemented (low priority for static site)

**Future consideration:**
- Add client-side rate limiting for booking button clicks
- Consider CAPTCHA for high-volume scenarios

---

## 2. Architecture

### 2.1 Code Sharing & DRY Improvements ✅

**Status:** Implemented

#### Shared Service Components ✅

Created in `/src/components/specialist/`:
- `HeroSection.astro` - Specialist hero section
- `CategoriesSection.astro` - Category grid
- `ServicesSection.astro` - Services grid wrapper
- `ServiceCard.astro` - Individual service card
- `GallerySection.astro` - Gallery display
- `CTASection.astro` - Call-to-action section

#### Unified Layout Structure ✅

```
/src/layouts/
├── BaseLayout.astro           # Common head, SEO, scripts
└── SpecialistLayout.astro     # Dynamic theme application
```

#### Shared Utilities ✅

Created in `/src/utils/specialists.ts`:
- `getAllSpecialists()` - Returns all specialists
- `getSpecialistBySlug(slug)` - Lookup by URL slug
- `getSpecialistById(id)` - Lookup by ID
- `getHolidays()` - Get holiday exceptions
- `getBookingSettings()` - Get booking configuration
- `generateThemeStyles(specialist)` - Generate inline CSS variables

### 2.2 Component Consistency ✅

**Status:** Implemented

**Interactive (Vue):**
- CalendarWidget
- LanguageSwitcher
- Navigation (mobile menu)
- Carousels (testimonials, portfolio)
- CookieConsent
- WhatsAppButton

**Static (Astro):**
- ServiceCard, ServicesSection
- Header, Footer
- Hero sections
- Contact sections
- Legal pages
- All specialist section components

### 2.3 CSS/Styling Consistency ✅

**Status:** Implemented

- Created `/src/styles/themes/base.css` with shared patterns
- Theme-specific files import base and add customizations:
  - `massage-wellness.css` - Golden/spiritual theme
  - `nail-art.css` - Purple/artistic theme
- CSS custom properties for all theme colors
- Consistent class naming (`.service-card`, `.btn-primary`, `.section-title`)

### 2.4 TypeScript Improvements ✅

**Status:** Implemented

Created `/src/types/specialist.ts` with:
- `LocalizedString` - Multilingual text
- `ThemeConfig` - Theme configuration
- `Availability` - Working hours
- `Service`, `Category`, `GalleryItem`
- `Specialist` - Complete unified interface
- `Holiday`, `BookingSettings`

### 2.5 Data Loading Pattern ✅

**Status:** Implemented

Centralized data access in `/src/utils/specialists.ts`:
- Single import point for all specialist data
- Type-safe access to specialist properties
- Shared holiday and booking settings

---

## 3. Internationalization (i18n)

### 3.1 Consolidate All Translations to JSON ✅

**Status:** Implemented

- All UI strings moved to translation JSON files
- No hardcoded strings in components
- WhatsAppButton.vue uses translations via locale prop

#### Translation File Structure ✅

```
/src/i18n/
├── index.ts      # Translation utilities, getTranslations(), getLocalizedValue()
├── de.json       # German translations (default)
├── fr.json       # French translations
└── en.json       # English translations
```

### 3.2 Service Content Structure ✅

**Status:** Kept inline multilingual objects (simpler for content editors)

Each service has inline translations:
```json
{
  "name": { "de": "...", "fr": "...", "en": "..." },
  "description": { "de": "...", "fr": "...", "en": "..." }
}
```

### 3.3 Localize Legal Pages ✅

**Status:** Implemented

- Privacy and Impressum pages use translation keys
- All legal content in JSON files under `legal.*` namespace
- Structured translations:
  - `legal.privacy.*` - Privacy policy sections
  - `legal.impressum.*` - Impressum sections

### 3.4 Date/Time Localization ✅

**Status:** Implemented in CalendarWidget.vue

Uses `Intl.DateTimeFormat` with locale-appropriate formatting.

---

## 4. Specialist Configuration (Single JSON File Approach)

### 4.1 Previous State (Before Optimization)

Adding a new specialist required:
1. `services-owner*.json` - Services and metadata
2. Availability entries in `availability.json`
3. New theme CSS file
4. New layout file (Owner*Layout.astro)
5. New page file

### 4.2 Current State ✅

**Status:** Fully implemented

Each specialist is defined by a single comprehensive JSON file.

#### Unified Specialist Schema ✅

```json
// /src/data/specialists/massage-wellness.json
{
  "id": "massage-wellness",
  "slug": "massage-wellness",
  "name": { "de": "...", "fr": "...", "en": "..." },
  "title": { "de": "...", "fr": "...", "en": "..." },
  "bio": { "de": "...", "fr": "...", "en": "..." },
  "avatar": "/images/massage-wellness/avatar.jpg",
  "contact": {
    "whatsapp": "+41791234567",
    "email": "wellness@example.ch"
  },
  "theme": {
    "id": "spiritual",
    "primaryColor": "#b8860b",
    "gradientPrimary": "linear-gradient(135deg, #d4a853 0%, #b8860b 100%)",
    "fontDisplay": "Cormorant Garamond, serif",
    "cssVariables": { ... }
  },
  "availability": {
    "defaultWorkingHours": { ... },
    "breaks": { ... }
  },
  "categories": [ ... ],
  "services": [ ... ],
  "gallery": [ ... ]
}
```

#### Dynamic Page Generation ✅

Implemented in `/src/pages/[specialist].astro`:

```typescript
export async function getStaticPaths() {
  const specialists = getAllSpecialists();
  return specialists.map((specialist) => ({
    params: { specialist: specialist.slug },
    props: { specialist },
  }));
}
```

#### Dynamic Theme Application ✅

Implemented in `/src/layouts/SpecialistLayout.astro`:

```astro
const themeClass = `theme-${specialist.id}`;
const themeStyles = generateThemeStyles(specialist);

<div class={themeClass} style={themeStyles}>
  <slot />
</div>
```

#### Specialist Loader ✅

Implemented in `/src/utils/specialists.ts`:

```typescript
export function getAllSpecialists(): Specialist[]
export function getSpecialistBySlug(slug: string): Specialist | undefined
export function getSpecialistById(id: string): Specialist | undefined
export function getHolidays(): Holiday[]
export function getBookingSettings(): BookingSettings
export function generateThemeStyles(specialist: Specialist): string
```

### 4.3 Current File Structure ✅

```
/src/data/
├── specialists/
│   ├── massage-wellness.json    # Complete specialist config
│   └── nail-art.json            # Complete specialist config
├── site-config.json             # Global site configuration
├── testimonials.json            # Shared testimonials
└── holidays.json                # Shared holiday exceptions & booking settings
```

### 4.4 Adding a New Specialist ✅

After optimization, adding a new specialist requires only:

1. Create `/src/data/specialists/new-specialist.json`
2. Create `/src/styles/themes/new-specialist.css`
3. Add images to `/public/images/new-specialist/`
4. Import CSS in `SpecialistLayout.astro`

The system automatically:
- Generates the page route at `/new-specialist`
- Applies theme styling
- Configures availability calendar
- Lists services in the correct format

### 4.5 Deleted Files ✅

The following deprecated files were removed:
- `src/layouts/Owner1Layout.astro`
- `src/layouts/Owner2Layout.astro`
- `src/pages/massage-wellness.astro`
- `src/pages/nail-art.astro`
- `src/data/services-owner1.json`
- `src/data/services-owner2.json`
- `src/data/availability.json`
- `src/styles/themes/owner1.css`
- `src/styles/themes/owner2.css`

---

## 5. Additional Recommendations

### 5.1 Testing

**Status:** Not implemented

- Add unit tests for utility functions
- Add E2E tests for booking flow
- Add visual regression tests for themes

### 5.2 Documentation ✅

**Status:** Partially implemented

- `features.md` - Complete feature documentation
- `optimizations.md` - This file
- TypeScript interfaces document the data schema

**Future:**
- Create CONTRIBUTING.md with development guidelines
- Add inline JSDoc comments for utilities

### 5.3 Performance

**Status:** Partially implemented

✅ Lazy image loading
✅ Efficient Vue hydration strategies
✅ CSS transitions and animations

**Future:**
- Implement image optimization pipeline
- Add service worker for offline support
- Consider preloading critical assets

### 5.4 Monitoring

**Status:** Not implemented

- Add error tracking (Sentry or similar)
- Implement analytics with privacy-respecting solution
- Monitor Core Web Vitals

---

## Implementation Summary

| Optimization                         | Status      |
| ------------------------------------ | ----------- |
| Single JSON per specialist           | ✅ Done     |
| Consolidate translations to JSON     | ✅ Done     |
| Security headers (CSP, etc.)         | ✅ Done     |
| Create shared component library      | ✅ Done     |
| Localize legal pages                 | ✅ Done     |
| Centralize type definitions          | ✅ Done     |
| Dynamic page generation              | ✅ Done     |
| Unified theme system                 | ✅ Done     |
| Add testing infrastructure           | ⬚ Pending  |
| Add monitoring                       | ⬚ Pending  |
