# Features

## Overview

Polished Beauty & Wellness Studio is an Astro-based static website with Vue.js interactive components for a Swiss beauty studio with multiple independent specialists.

---

## Core Features

### 1. Multi-Specialist Support

- Two independent specialists (massage-wellness & nail-art) with distinct branding
- Per-specialist theming (colors, fonts, styling)
- Dynamic page generation via `[specialist].astro`
- Separate detail pages: `/massage-wellness` and `/nail-art`
- Individual contact information (WhatsApp, email)
- Independent service catalogs and pricing
- Single JSON file per specialist for easy management

### 2. Booking System

- WhatsApp-based booking integration (no backend required)
- Interactive calendar widget with date/time selection
- Availability checking per specialist
- Booking constraints:
  - Minimum advance booking: 24 hours
  - Maximum advance booking: 30 days
  - 30-minute slot duration
  - 15-minute buffer between appointments
- Holiday/exception date handling (Swiss holidays)
- Pre-filled WhatsApp message with booking details

### 3. Service Management

**Massage & Wellness (7 services, 3 categories):**

- Massage: Sport, Wellness, Hot Stone
- Waxing: Full Body, Leg
- Cosmetics: Facial, Anti-Aging

**Nail Art (7 services, 4 categories):**

- Manicure: Classic, Gel, Repair
- Nail Art: Artistic, French
- Extensions: Acrylic, Gel
- Eyelash: Coming Soon

Each service includes: name, description, duration, price, featured flag

### 4. Portfolio & Gallery

- Massage & Wellness: Gallery with showcase images
- Nail Art: Portfolio with tagging system (floral, geometric, glitter, abstract, wedding, seasonal)
- Image filtering by tags
- Responsive image grid layouts

### 5. Testimonials

- Verified client testimonials with star ratings
- Auto-rotating carousel (5-second intervals)
- Manual navigation controls
- Multi-language support
- Specialist/service association

### 6. Internationalization (i18n)

- Three supported languages: German (de), French (fr), English (en)
- Default language: German
- URL-based language switching: `/`, `/fr`, `/en`
- All UI strings stored in JSON translation files
- Localized legal pages (privacy, impressum)
- Language switcher dropdown

---

## User Interface Features

### 7. Responsive Design

- Mobile-first approach
- Hamburger navigation for mobile devices
- Fully responsive layouts across all breakpoints
- Touch-friendly interactive elements

### 8. Theming System

- Two distinct visual themes:
  - **Spiritual** (Massage & Wellness): Golden colors, serif fonts (Cormorant Garamond)
  - **Arty** (Nail Art): Purple/Pink colors, sans-serif fonts (Poppins)
- CSS custom properties for easy customization
- Shared base theme styles (`base.css`)
- Dynamic theme application via `SpecialistLayout.astro`

### 9. Navigation

- Sticky header with smooth scroll
- Hash-based section navigation (`/#calendar`, `/#contact`)
- Mobile hamburger menu with overlay
- Floating WhatsApp button for quick contact

### 10. Accessibility

- ARIA labels on interactive elements
- Focus-visible styles
- Reduced motion media query support
- Semantic HTML structure
- Alt text for all images
- Proper form label associations

---

## Legal & Privacy Features

### 11. Cookie Consent Management

- GDPR-compliant cookie banner
- Three-tier cookie system:
  - Necessary (required)
  - Analytics (optional)
  - Marketing (optional)
- Persistent preferences in LocalStorage
- Custom event dispatching for consent changes

### 12. Legal Pages

- Privacy policy page (`/privacy`) - fully translated
- Impressum/Legal notice page (`/impressum`) - fully translated
- Covers data protection, user rights, contact information

---

## Technical Features

### 13. Security

- Security middleware with HTTP headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` for camera, microphone, geolocation
  - Content Security Policy (CSP)
- External links with `rel="noopener noreferrer"`
- URL encoding for WhatsApp messages

### 14. SEO Optimization

- Dynamic meta tags per page
- Canonical URLs
- Open Graph tags for social sharing
- Twitter card metadata
- Sitemap generation (@astrojs/sitemap)
- Schema.org JSON-LD structured data (BeautySalon)

### 15. Performance

- Static site generation (SSG)
- Lazy image loading
- Efficient Vue component hydration strategies:
  - `client:load` for critical components
  - `client:visible` for below-fold content
  - `client:idle` for non-critical features
- CSS transitions and animations

### 16. Configuration-Driven Content

- JSON-based data files:
  - `site-config.json`: Site metadata, contact info, social links
  - `specialists/massage-wellness.json`: Complete specialist configuration
  - `specialists/nail-art.json`: Complete specialist configuration
  - `holidays.json`: Shared holiday exceptions and booking settings
  - `testimonials.json`: Client reviews and ratings
- Easy content updates without code changes

---

## Architecture

### Project Structure

```
/src/
├── components/
│   ├── common/           # Shared components (Footer, WhatsAppButton, etc.)
│   ├── home/             # Homepage components (ServicesSummary, CalendarWidget, etc.)
│   ├── specialist/       # Reusable specialist page sections
│   │   ├── HeroSection.astro
│   │   ├── CategoriesSection.astro
│   │   ├── ServicesSection.astro
│   │   ├── ServiceCard.astro
│   │   ├── GallerySection.astro
│   │   └── CTASection.astro
│   └── nail-art/         # Nail art specific (PortfolioCarousel)
├── data/
│   ├── specialists/      # Unified specialist JSON files
│   │   ├── massage-wellness.json
│   │   └── nail-art.json
│   ├── site-config.json
│   ├── holidays.json
│   └── testimonials.json
├── i18n/                 # Translation files (de.json, fr.json, en.json)
├── layouts/
│   ├── BaseLayout.astro
│   └── SpecialistLayout.astro
├── pages/
│   ├── index.astro
│   ├── [specialist].astro  # Dynamic specialist pages
│   ├── privacy.astro
│   └── impressum.astro
├── styles/
│   └── themes/
│       ├── base.css           # Shared theme styles
│       ├── massage-wellness.css
│       └── nail-art.css
├── types/
│   └── specialist.ts     # TypeScript interfaces
├── utils/
│   └── specialists.ts    # Specialist loader utilities
└── middleware.ts         # Security headers
```

### Data Configuration

#### Specialist Configuration (`specialists/*.json`)

Each specialist is fully defined in a single JSON file containing:
- Identity: id, slug, name, title, bio, avatar
- Contact: whatsapp, email
- Theme: id, primaryColor, gradientPrimary, fontDisplay, cssVariables
- Availability: defaultWorkingHours, breaks
- Categories and Services
- Gallery items

#### Site Configuration (`site-config.json`)

- Site name, tagline, description
- Contact: address, phone, email, WhatsApp
- Social media links
- Legal: company name, UID, VAT status
- SEO defaults

#### Holidays (`holidays.json`)

- Holiday exceptions with dates and types
- Booking settings (minAdvanceHours, maxAdvanceDays, slotDuration, bufferMinutes)

#### Testimonials (`testimonials.json`)

- Client reviews with ratings
- Specialist association (massage-wellness, nail-art, or null for both)
- Display and rotation settings

---

## Adding a New Specialist

Adding a new specialist requires only:

1. Create `/src/data/specialists/new-specialist.json` with full configuration
2. Create `/src/styles/themes/new-specialist.css` with theme styles
3. Add images to `/public/images/new-specialist/`
4. Import CSS in `SpecialistLayout.astro`

The dynamic page generation handles everything else automatically.
