# Polished - Technical Architecture Documentation

**Version:** 2.0
**Date:** January 2026
**Status:** Design Complete, Ready for Implementation
**Architecture:** Platform-Independent, Docker-First

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Multi-Tenancy Strategy](#multi-tenancy-strategy)
6. [API Design](#api-design)
7. [Security & Scalability](#security--scalability)
8. [Developer Experience](#developer-experience)
9. [Infrastructure](#infrastructure)
10. [Implementation Priorities](#implementation-priorities)

---

## Executive Summary

Polished is a multi-tenant SaaS booking platform built with a **platform-independent, modern TypeScript architecture** that prioritizes flexibility, performance, and cost control. The architecture avoids vendor lock-in while maintaining type safety and developer experience.

**Key Architectural Decisions:**
- **Vue3 + Shadcn-Vue** for flexible, performant frontend (not tied to any platform)
- **Bun + tRPC** for blazingly fast backend with end-to-end type safety
- **Direct PostgreSQL + Zod** for type-safe database access without ORM overhead
- **Docker Compose** for local development and flexible deployment (Hetzner, AWS, self-hosted)
- **Turborepo** monorepo for shared types and efficient builds
- **SSR-capable** via Vue 3 native SSR (rendered by Bun) for SEO-critical pages

**Why This Stack:**
1. **Platform Independence**: No vendor lock-in (Vercel, AWS, etc.)
2. **Performance**: Bun is 3x+ faster than Node.js
3. **Cost Control**: Self-host on Hetzner ($5-20/month vs $100+ on Vercel)
4. **Flexibility**: Docker means deploy anywhere
5. **Type Safety**: Zod + tRPC provides end-to-end types without ORM complexity
6. **Simplicity**: Direct SQL is clearer than ORM abstractions

---

## Tech Stack

### Frontend Stack

**Architecture: Astro for Landing Pages + Vue 3 SPAs for Dashboards**

**Rationale:**
- **Astro**: Perfect for content-focused, SEO-critical landing pages
- **Vue 3**: Excellent for interactive admin/employee dashboards (SPAs)
- **Separation of Concerns**: Static marketing pages vs dynamic applications
- **Performance**: Astro ships zero JS by default, Vue hydrates only where needed
- **Maintainability**: No raw HTML strings in API - proper component architecture

**Why Astro for Landing Pages:**
1. **SEO-First**: Pre-rendered HTML, perfect Lighthouse scores
2. **Component-Based**: Proper `.astro` components, not template literals
3. **Island Architecture**: Interactive Vue components only where needed
4. **Build-Time Data**: Fetch studio data at build, serve static HTML
5. **Multi-Tenant**: Generate pages for each studio subdomain
6. **CDN-Ready**: Static files can be cached globally

**Why Vue 3 SPAs for Admin/Employee:**
1. Highly interactive dashboards don't need SSR
2. Real-time updates via tRPC subscriptions
3. Complex state management with Pinia
4. Consistent component library (shadcn-vue)

**Supporting Libraries:**
- **UI Framework**: Shadcn-Vue + Tailwind CSS (Vue port of shadcn/ui)
- **State Management**: Pinia (official Vue state management)
- **API Client**: tRPC client for Vue
- **Form Handling**: VeeValidate + Zod (validation)
- **Routing**: Vue Router (for SPAs), Astro routing (for landing)
- **Date/Time**: date-fns (booking timeslots)
- **Charts/Analytics**: Chart.js or Apache ECharts (admin dashboard)

**Project Structure:**
```
apps/
├── landing/          # Astro (public landing pages + booking flow)
│   ├── src/
│   │   ├── layouts/
│   │   │   └── StudioLayout.astro
│   │   ├── pages/
│   │   │   ├── [subdomain]/
│   │   │   │   ├── index.astro      # Landing page
│   │   │   │   └── book.astro       # Booking flow
│   │   │   └── index.astro          # Main marketing site
│   │   ├── components/
│   │   │   ├── HeroSection.astro
│   │   │   ├── ServiceCard.astro
│   │   │   ├── TeamGallery.astro
│   │   │   └── BookingFlow.vue      # Vue island for interactivity
│   │   └── styles/
│   │       └── global.css
│   ├── astro.config.mjs
│   └── package.json
│
├── admin/            # Vue 3 SPA (admin dashboard)
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── router.ts
│   │   └── views/
│   │       ├── Dashboard.vue
│   │       ├── Bookings.vue
│   │       ├── Services.vue
│   │       └── Team.vue
│   └── vite.config.ts
│
├── employee/         # Vue 3 SPA (employee portal)
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   └── views/
│   └── vite.config.ts
│
└── api/              # Bun + tRPC (pure API, no SSR)
    ├── src/
    │   ├── server.ts
    │   ├── routers/
    │   └── middleware/
    └── package.json
```

### Backend Stack

**Runtime: Bun + tRPC (Pure API Server)**

**Rationale:**
- **Bun**: 3-4x faster than Node.js, built-in TypeScript, native PostgreSQL support
- **tRPC**: End-to-end type safety without code generation
- **Zero Dependencies**: Bun includes bundler, test runner, package manager
- **Native APIs**: Built-in fetch, WebSocket, file operations
- **Performance**: ~30k requests/sec vs Node's ~10k
- **Pure API**: No SSR responsibility - cleaner separation of concerns

**Architecture (Pure API):**
```typescript
// apps/api/src/server.ts
import { serve } from 'bun';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './router';
import { createContext } from './context';

serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // tRPC API endpoints
    if (url.pathname.startsWith('/api/trpc')) {
      return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext,
      });
    }

    // REST endpoints for Astro build-time data fetching
    if (url.pathname.startsWith('/api/')) {
      return handleRestEndpoints(req, url);
    }

    return new Response('Not Found', { status: 404 });
  },
});
```

**Astro Integration:**

```typescript
// apps/landing/src/pages/[subdomain]/index.astro
---
import StudioLayout from '../../layouts/StudioLayout.astro';
import HeroSection from '../../components/HeroSection.astro';
import ServiceGrid from '../../components/ServiceGrid.astro';
import TeamGallery from '../../components/TeamGallery.astro';

// Fetch data at build time
export async function getStaticPaths() {
  const res = await fetch(`${import.meta.env.API_URL}/api/studios`);
  const studios = await res.json();

  return studios.map((studio) => ({
    params: { subdomain: studio.subdomain },
    props: { studio },
  }));
}

const { studio } = Astro.props;

// Fetch additional data
const [services, employees] = await Promise.all([
  fetch(`${import.meta.env.API_URL}/api/studio?subdomain=${studio.subdomain}`).then(r => r.json()),
]);
---

<StudioLayout studio={studio}>
  <HeroSection studio={studio} />
  <ServiceGrid services={services} />
  <TeamGallery employees={employees} />
</StudioLayout>
```

**Rebuild Strategy:**

When studio data changes (via admin dashboard), trigger Astro rebuild:

```typescript
// apps/api/src/routers/studio.ts
export const studioRouter = t.router({
  update: protectedProcedure
    .input(UpdateStudioSchema)
    .mutation(async ({ input, ctx }) => {
      const updated = await updateStudio(ctx.db, input);

      // Trigger Astro rebuild for this studio
      await triggerLandingPageRebuild(updated.subdomain);

      return updated;
    }),
});

// Rebuild trigger (webhook to build service)
async function triggerLandingPageRebuild(subdomain: string) {
  await fetch(process.env.BUILD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subdomain, action: 'rebuild' }),
  });
}
```

**Supporting Libraries:**
- **Validation**: Zod (schema validation + type inference)
- **Testing**: Bun's built-in test runner
- **Rate Limiting**: Custom middleware with Redis
- **Job Queue**: BullMQ for WhatsApp notifications

### Database

**Primary: PostgreSQL (Self-Hosted or Managed)**

**Rationale:**
- **Relational**: Perfect for multi-tenant data with complex relationships
- **JSONB**: Flexible theme customization storage
- **Row-Level Security**: Native tenant isolation
- **Full-text search**: Built-in search capabilities
- **Proven at scale**: Handles millions of bookings

**No ORM - Direct SQL with Bun + Zod:**

**Why No ORM:**
1. **Performance**: Direct queries are faster, no ORM overhead
2. **Clarity**: SQL is explicit, easier to debug
3. **Control**: Full control over queries and optimizations
4. **Type Safety**: Zod provides runtime validation + type inference
5. **Simplicity**: No ORM DSL to learn, just SQL + TypeScript

**Pattern:**

```typescript
// packages/database/src/queries/studio.ts
import { z } from 'zod';

// Zod schema defines both validation AND TypeScript type
export const StudioSchema = z.object({
  id: z.string().cuid(),
  subdomain: z.string(),
  name: z.string(),
  logoUrl: z.string().url().nullable(),
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    font: z.string(),
  }),
  plan: z.enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  maxEmployees: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Studio = z.infer<typeof StudioSchema>;

// Direct SQL query with type safety
export async function getStudioBySubdomain(
  db: Database,
  subdomain: string
): Promise<Studio | null> {
  const result = await db.query(
    `SELECT * FROM studios WHERE subdomain = $1`,
    [subdomain]
  );

  if (result.rows.length === 0) return null;

  // Zod validates at runtime and provides type
  return StudioSchema.parse(result.rows[0]);
}

// Insert with validation
export async function createStudio(
  db: Database,
  data: Omit<Studio, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Studio> {
  // Validate input
  const validated = StudioSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }).parse(data);

  const result = await db.query(
    `INSERT INTO studios (subdomain, name, logo_url, theme, plan, max_employees)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      validated.subdomain,
      validated.name,
      validated.logoUrl,
      JSON.stringify(validated.theme),
      validated.plan,
      validated.maxEmployees,
    ]
  );

  return StudioSchema.parse(result.rows[0]);
}
```

**Bun Native PostgreSQL:**

```typescript
// packages/database/src/client.ts
import { Database } from 'bun:sqlite'; // For development
import postgres from 'postgres'; // For production PostgreSQL

export function createDatabase() {
  if (process.env.NODE_ENV === 'production') {
    // PostgreSQL in production
    return postgres(process.env.DATABASE_URL!, {
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  } else {
    // SQLite for local dev (optional)
    return new Database('dev.db');
  }
}
```

**Migrations:**

```sql
-- migrations/001_create_studios.sql
CREATE TABLE studios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  theme JSONB NOT NULL DEFAULT '{}'::JSONB,
  plan TEXT NOT NULL DEFAULT 'TRIAL',
  max_employees INTEGER NOT NULL DEFAULT 5,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_studios_subdomain ON studios(subdomain);
CREATE INDEX idx_studios_custom_domain ON studios(custom_domain);

-- Enable Row-Level Security
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their studio
CREATE POLICY studio_isolation ON studios
  USING (id = current_setting('app.studio_id', true)::TEXT);
```

**Migration Runner:**

```typescript
// scripts/migrate.ts
import { readdir, readFile } from 'fs/promises';
import { createDatabase } from '../packages/database';

async function runMigrations() {
  const db = createDatabase();
  const files = await readdir('./migrations');

  for (const file of files.sort()) {
    if (!file.endsWith('.sql')) continue;

    console.log(`Running migration: ${file}`);
    const sql = await readFile(`./migrations/${file}`, 'utf-8');
    await db.query(sql);
  }

  console.log('Migrations complete!');
}

runMigrations();
```

**Caching: Redis (Self-Hosted or Upstash)**

```typescript
// packages/cache/src/client.ts
import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URL,
});

// Cached queries
export async function getCachedStudio(subdomain: string): Promise<Studio | null> {
  const cached = await redis.get(`studio:${subdomain}`);
  if (cached) return JSON.parse(cached);

  const studio = await getStudioBySubdomain(db, subdomain);
  if (studio) {
    await redis.setEx(`studio:${subdomain}`, 3600, JSON.stringify(studio));
  }

  return studio;
}
```

### Authentication & Authorization

**Auth Provider: Custom JWT + Session Management**

**Rationale:**
- **No Vendor Lock-in**: Not tied to Clerk, Auth0, etc.
- **Full Control**: Custom logic for multi-tenancy
- **Cost Effective**: No per-user fees
- **Simple**: JWT + HTTP-only cookies

**Implementation:**

```typescript
// packages/auth/src/jwt.ts
import { sign, verify } from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  studioId: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
}

export function createToken(payload: JWTPayload): string {
  return sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload {
  return verify(token, process.env.JWT_SECRET!) as JWTPayload;
}

// packages/auth/src/password.ts
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 19456,
    timeCost: 2,
  });
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}
```

**Session Management:**

```typescript
// apps/api/src/middleware/auth.ts
import { verifyToken } from '@polished/auth';

export async function authMiddleware(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return { user: null, studioId: null };
  }

  try {
    const payload = verifyToken(token);
    return {
      userId: payload.userId,
      studioId: payload.studioId,
      role: payload.role,
    };
  } catch {
    return { user: null, studioId: null };
  }
}
```

**Authorization Matrix:**

| Resource | Studio Admin | Employee | Customer |
|----------|--------------|----------|----------|
| Studio Settings | Edit | View | None |
| Employees | CRUD | View All | None |
| Services | CRUD | Edit Own | View |
| Bookings | View All | View Own | Create |
| Theme | Edit | None | None |

### File Storage

**Provider: S3-Compatible Storage (MinIO Self-Hosted or Cloudflare R2)**

**Rationale:**
- **MinIO**: Self-hosted, S3-compatible, free
- **Cloudflare R2**: Managed, zero egress fees
- **Flexibility**: Can switch providers easily (S3 API standard)

```typescript
// packages/storage/src/client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export async function uploadFile(
  key: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  }));

  return `${process.env.CDN_URL}/${key}`;
}
```

### WhatsApp Integration

**Provider: Twilio WhatsApp Business API**

```typescript
// packages/whatsapp/src/client.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<void> {
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${to}`,
    body,
  });
}

// packages/whatsapp/src/queue.ts
import { Queue } from 'bullmq';

export const whatsappQueue = new Queue('whatsapp', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export async function queueWhatsAppNotification(
  type: 'booking.confirmed' | 'booking.reminder',
  data: any
) {
  await whatsappQueue.add(type, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}
```

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│  Studio Landing     │  Admin Dashboard    │  Employee Portal        │
│  (Astro Static)     │  (Vue 3 SPA)        │  (Vue 3 SPA)            │
│  subdomain.app      │  admin.polished.app │  app.polished.app       │
│  CDN-Cached         │                     │                         │
└─────────┬───────────┴──────────┬──────────┴──────────┬──────────────┘
          │                      │                      │
          │ Build-time fetch     │ Runtime API calls    │
          │                      │                      │
          │         ┌────────────┴──────────────────────┘
          │         │
          │ ┌───────▼────────┐
          │ │  NGINX/CADDY   │
          │ │  (Reverse Proxy)│
          │ │ - SSL/TLS      │
          │ │ - Rate Limit   │
          │ │ - Static Files │
          │ └───────┬────────┘
          │         │
          │ ┌───────▼────────┐
          └─►   BUN SERVER   │◄── Webhook triggers rebuild
            │   (Pure API)   │
            │ - tRPC Router  │
            │ - REST APIs    │
            │ - Auth         │
            └───────┬────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼─────┐  ┌────▼─────┐  ┌─────▼──────┐
│PostgreSQL│  │  Redis   │  │ Message    │
│(Docker)  │  │ (Docker) │  │ Queue      │
│          │  │          │  │ (BullMQ)   │
└──────────┘  └──────────┘  └─────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │  Twilio     │
                            │  WhatsApp   │
                            └─────────────┘

┌─────────────────────────────────────────┐
│     MinIO / S3 / Cloudflare R2          │
│     (Employee Photos, Logos, Assets)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     CDN (Cloudflare / BunnyCDN)         │
│     (Astro Static Pages + Assets)       │
└─────────────────────────────────────────┘
```

**Data Flow:**
1. **Landing Pages**: Astro fetches data at build-time → Static HTML served via CDN
2. **Admin/Employee**: Vue SPAs make real-time API calls to Bun server
3. **Rebuild Trigger**: Admin updates studio → API triggers Astro rebuild → New static pages deployed

**All services run in Docker containers for easy deployment anywhere.**

---

## Database Schema

### Database Design Without ORM

**Principles:**
1. **PostgreSQL native types**: Use TIMESTAMPTZ, JSONB, ARRAY types
2. **Constraints at DB level**: Foreign keys, unique constraints, check constraints
3. **Zod for validation**: Runtime validation + TypeScript types
4. **Migrations in SQL**: Clear, version-controlled schema changes

### Core Tables

```sql
-- migrations/001_create_core_tables.sql

-- Studios (Tenants)
CREATE TABLE studios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Branding
  logo_url TEXT,
  theme JSONB NOT NULL DEFAULT '{
    "primaryColor": "#4f46e5",
    "secondaryColor": "#10b981",
    "font": "Inter"
  }'::JSONB,

  -- Subscription
  plan TEXT NOT NULL DEFAULT 'TRIAL' CHECK (plan IN ('TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
  max_employees INTEGER NOT NULL DEFAULT 5,

  -- Contact
  phone TEXT,
  email TEXT,
  address TEXT,

  -- Owner
  owner_id TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_studios_subdomain ON studios(subdomain);
CREATE INDEX idx_studios_owner ON studios(owner_id);

-- Users (Multi-role: Owner, Employee, Customer)
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL for social login
  name TEXT NOT NULL,
  phone TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Employees
CREATE TABLE employees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  studio_id TEXT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,

  -- Availability (stored as JSONB)
  working_hours JSONB NOT NULL DEFAULT '{
    "monday": [{"start": "09:00", "end": "17:00"}],
    "tuesday": [{"start": "09:00", "end": "17:00"}],
    "wednesday": [{"start": "09:00", "end": "17:00"}],
    "thursday": [{"start": "09:00", "end": "17:00"}],
    "friday": [{"start": "09:00", "end": "17:00"}],
    "saturday": [],
    "sunday": []
  }'::JSONB,

  buffer_time INTEGER NOT NULL DEFAULT 15, -- minutes

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (studio_id, user_id)
);

CREATE INDEX idx_employees_studio ON employees(studio_id);
CREATE INDEX idx_employees_user ON employees(user_id);

-- Services
CREATE TABLE services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  studio_id TEXT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,

  display_order INTEGER NOT NULL DEFAULT 0,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_studio ON services(studio_id);
CREATE INDEX idx_services_display ON services(studio_id, display_order);

-- Employee Services (Junction with pricing per employee)
CREATE TABLE employee_services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- minutes

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (employee_id, service_id)
);

CREATE INDEX idx_employee_services_employee ON employee_services(employee_id);
CREATE INDEX idx_employee_services_service ON employee_services(service_id);

-- Bookings
CREATE TABLE bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  studio_id TEXT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,

  -- What
  service_id TEXT NOT NULL REFERENCES services(id),

  -- Who
  employee_id TEXT NOT NULL REFERENCES employees(id),
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,

  -- When
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  )),

  -- Customer Info (for non-registered users)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- WhatsApp
  whatsapp_message_id TEXT,
  whatsapp_status TEXT,

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,

  -- Notes
  notes TEXT,
  private_notes TEXT, -- Employee-only notes

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent overlapping bookings
  EXCLUDE USING GIST (
    employee_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
);

CREATE INDEX idx_bookings_studio_time ON bookings(studio_id, start_time);
CREATE INDEX idx_bookings_employee_time ON bookings(employee_id, start_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Row-Level Security
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies (example for studios)
CREATE POLICY studio_isolation ON studios
  USING (id = current_setting('app.studio_id', true)::TEXT);
```

### Zod Schemas

```typescript
// packages/database/src/schemas/studio.ts
import { z } from 'zod';

export const StudioThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  font: z.string(),
});

export const StudioSchema = z.object({
  id: z.string().cuid(),
  subdomain: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/),
  customDomain: z.string().nullable(),
  name: z.string().min(1).max(100),
  slug: z.string(),
  logoUrl: z.string().url().nullable(),
  theme: StudioThemeSchema,
  plan: z.enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  maxEmployees: z.number().int().positive(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Studio = z.infer<typeof StudioSchema>;

// packages/database/src/schemas/booking.ts
export const BookingSchema = z.object({
  id: z.string().cuid(),
  studioId: z.string(),
  serviceId: z.string(),
  employeeId: z.string(),
  customerId: z.string().nullable(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().email().nullable(),
  whatsappMessageId: z.string().nullable(),
  whatsappStatus: z.string().nullable(),
  price: z.number(),
  notes: z.string().nullable(),
  privateNotes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Booking = z.infer<typeof BookingSchema>;
```

---

## Multi-Tenancy Strategy

### Approach: Subdomain-based with Database Row-Level Security

**Tenant Resolution in Reverse Proxy:**

```nginx
# nginx.conf or Caddyfile
server {
  listen 80;
  server_name *.polished.app;

  location / {
    # Extract subdomain and pass to backend
    set $subdomain "";
    if ($host ~* "^(.+)\.polished\.app$") {
      set $subdomain $1;
    }

    proxy_pass http://localhost:3001;
    proxy_set_header X-Subdomain $subdomain;
    proxy_set_header Host $host;
  }
}
```

**Tenant Resolution in Bun:**

```typescript
// apps/api/src/middleware/tenant.ts
export async function resolveTenant(req: Request) {
  const subdomain = req.headers.get('X-Subdomain');

  if (!subdomain || subdomain === 'www' || subdomain === 'app') {
    return null;
  }

  // Cached lookup
  const studio = await getCachedStudio(subdomain);
  return studio;
}

// apps/api/src/context.ts
export async function createContext({ req }: { req: Request }) {
  const studio = await resolveTenant(req);
  const auth = await authMiddleware(req);

  return {
    req,
    studioId: studio?.id,
    studio,
    userId: auth.userId,
    role: auth.role,
    db: createDatabase(),
  };
}
```

**Database-Level Isolation:**

```typescript
// packages/database/src/queries/with-tenant.ts
export async function withTenant<T>(
  db: Database,
  studioId: string,
  fn: () => Promise<T>
): Promise<T> {
  // Set tenant context for RLS
  await db.query(`SET LOCAL app.studio_id = $1`, [studioId]);

  try {
    return await fn();
  } finally {
    // Reset context
    await db.query(`RESET app.studio_id`);
  }
}

// Usage
const bookings = await withTenant(db, studioId, async () => {
  return await db.query(`SELECT * FROM bookings WHERE status = 'PENDING'`);
});
```

---

## API Design

### tRPC Router Structure

```typescript
// apps/api/src/router.ts
import { initTRPC } from '@trpc/server';
import { studioRouter } from './routers/studio';
import { serviceRouter } from './routers/service';
import { employeeRouter } from './routers/employee';
import { bookingRouter } from './routers/booking';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  studio: studioRouter,
  service: serviceRouter,
  employee: employeeRouter,
  booking: bookingRouter,
});

export type AppRouter = typeof appRouter;
```

### Example: Booking Router

```typescript
// apps/api/src/routers/booking.ts
import { z } from 'zod';
import { t, publicProcedure, protectedProcedure } from '../trpc';
import { createBooking, getBookings, updateBookingStatus } from '@polished/database';
import { queueWhatsAppNotification } from '@polished/whatsapp';

export const bookingRouter = t.router({
  // Create booking (public - no auth required)
  create: publicProcedure
    .input(z.object({
      serviceId: z.string(),
      employeeId: z.string(),
      startTime: z.date(),
      customerName: z.string(),
      customerPhone: z.string(),
      customerEmail: z.string().email().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.studioId) {
        throw new Error('Studio not found');
      }

      // Check availability
      const isAvailable = await checkAvailability(ctx.db, {
        employeeId: input.employeeId,
        startTime: input.startTime,
        duration: 60,
      });

      if (!isAvailable) {
        throw new Error('Time slot no longer available');
      }

      // Create booking
      const booking = await createBooking(ctx.db, {
        studioId: ctx.studioId,
        ...input,
        status: 'PENDING',
        endTime: new Date(input.startTime.getTime() + 60 * 60 * 1000),
      });

      // Queue WhatsApp notification
      await queueWhatsAppNotification('booking.confirmed', { bookingId: booking.id });

      return booking;
    }),

  // List bookings (protected)
  list: protectedProcedure
    .input(z.object({
      employeeId: z.string().optional(),
      status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      return await getBookings(ctx.db, ctx.studioId!, input);
    }),

  // Update status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    }))
    .mutation(async ({ input, ctx }) => {
      const updated = await updateBookingStatus(ctx.db, input.id, input.status);

      if (input.status === 'CONFIRMED') {
        await queueWhatsAppNotification('booking.employee_confirmed', {
          bookingId: input.id,
        });
      }

      return updated;
    }),
});
```

---

## Security & Scalability

### Security Measures

**1. Multi-Tenant Data Isolation:**
- Row-level security at database level
- Tenant context in application layer
- All queries filtered by studioId

**2. Authentication:**
- JWT with HTTP-only cookies
- Argon2id password hashing (Bun native)
- CSRF protection with tokens

**3. Rate Limiting:**

```typescript
// apps/api/src/middleware/ratelimit.ts
import { redis } from '@polished/cache';

export async function rateLimit(req: Request, limit: number, window: number) {
  const ip = req.headers.get('X-Forwarded-For') || 'unknown';
  const key = `ratelimit:${ip}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  if (current > limit) {
    throw new Error('Rate limit exceeded');
  }
}
```

**4. Input Validation:**
- All inputs validated with Zod
- SQL injection prevented by parameterized queries
- XSS prevention in Vue templates

### Scalability Considerations

**Horizontal Scaling:**
- Stateless Bun servers (scale behind load balancer)
- PostgreSQL read replicas for heavy read queries
- Redis for distributed caching
- BullMQ for job processing

**Performance Optimizations:**
- Database connection pooling
- Query result caching (Redis)
- Static asset CDN
- Image optimization

**Monitoring:**
```typescript
// Simple metrics endpoint
app.get('/metrics', async () => {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: await db.query('SELECT count(*) FROM pg_stat_activity'),
  };
});
```

---

## Developer Experience

### Monorepo Structure (Turborepo)

```
polished/
├── apps/
│   ├── landing/          # Astro (public landing pages)
│   │   ├── src/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   │   ├── [subdomain]/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── book.astro
│   │   │   │   └── index.astro
│   │   │   └── components/
│   │   ├── astro.config.mjs
│   │   └── package.json
│   ├── admin/            # Vue 3 SPA (admin dashboard)
│   ├── employee/         # Vue 3 SPA (employee portal)
│   └── api/              # Bun + tRPC backend (pure API)
│
├── packages/
│   ├── database/         # SQL migrations, queries, Zod schemas
│   ├── ui/               # Shadcn-Vue components (shared)
│   ├── auth/             # JWT, password hashing
│   ├── cache/            # Redis client
│   ├── storage/          # S3/MinIO client
│   ├── whatsapp/         # WhatsApp integration
│   └── config/           # Shared configs (ESLint, TypeScript)
│
├── docker-compose.yml    # Local development services
├── Dockerfile            # Production container
├── turbo.json
└── package.json
```

### Local Development

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: polished
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

**Development Commands:**

```bash
# Start all services
docker-compose up -d

# Install dependencies (Bun is fast!)
bun install

# Run migrations
bun run migrate

# Start all apps in development
bun run dev

# Run tests
bun test

# Build for production
bun run build
```

### Testing

```typescript
// packages/database/src/queries/studio.test.ts
import { describe, test, expect, beforeAll } from 'bun:test';
import { createDatabase } from '../client';
import { createStudio, getStudioBySubdomain } from './studio';

describe('Studio Queries', () => {
  let db: Database;

  beforeAll(async () => {
    db = createDatabase();
    await db.query('BEGIN');
  });

  test('creates and retrieves studio', async () => {
    const studio = await createStudio(db, {
      subdomain: 'test-studio',
      name: 'Test Studio',
      slug: 'test-studio',
      theme: {
        primaryColor: '#4f46e5',
        secondaryColor: '#10b981',
        font: 'Inter',
      },
      plan: 'TRIAL',
      maxEmployees: 5,
      ownerId: 'user-123',
    });

    expect(studio.subdomain).toBe('test-studio');

    const retrieved = await getStudioBySubdomain(db, 'test-studio');
    expect(retrieved?.id).toBe(studio.id);
  });
});
```

---

## Infrastructure

### Deployment Options

**1. Self-Hosted (Hetzner, DigitalOcean, etc.)**

**Dockerfile:**

```dockerfile
FROM oven/bun:1 as builder

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["bun", "run", "start"]
```

**docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - api

  api:
    build: .
    environment:
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres:5432/polished
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/var/lib/redis

volumes:
  postgres_data:
  redis_data:
```

**2. Cloud Deployment (Fly.io, Railway, Render)**

Simple deployment:
```bash
# fly.io example
fly launch
fly deploy
```

### Cost Comparison

**Self-Hosted (Hetzner CPX31):**
- 8 vCPU, 16GB RAM, 240GB SSD
- **Cost: €16.50/month (~$18/month)**
- Can handle 1000+ studios easily

**vs Vercel/Serverless:**
- Vercel Pro: $20/month + usage
- Supabase Pro: $25/month
- Clerk Pro: $25/month
- **Total: $70+/month minimum**

**Savings: 75%+ at scale**

---

## Implementation Priorities

### Phase 1: Foundation
1. ✅ Turborepo setup
2. ✅ Docker Compose for local dev
3. ✅ Bun backend with tRPC
4. ✅ PostgreSQL schema + migrations
5. ⏳ Astro landing page setup
6. ⏳ Vue 3 admin/employee SPA setup

### Phase 2: Data Layer
1. Database migrations
2. Zod schemas for all models
3. Query functions with type safety
4. Multi-tenant middleware
5. REST API endpoints for Astro build-time fetching

### Phase 3: Customer Experience
1. Astro landing page components (HeroSection, ServiceGrid, TeamGallery)
2. Booking flow (Vue island component in Astro)
3. Service/employee browsing (static pages)
4. Booking confirmation (API + WhatsApp)
5. Build/deploy pipeline for Astro

### Phase 4: Admin & Employee
1. Admin dashboard (Vue 3 SPA)
2. Calendar views
3. Service/employee management
4. Employee portal (Vue 3 SPA)
5. Rebuild trigger on studio updates

### Phase 5: Integration
1. WhatsApp integration
2. Theme customization (triggers rebuild)
3. Analytics dashboard

### Phase 6: Deployment
1. Docker production setup
2. NGINX/Caddy configuration
3. CDN setup for Astro static pages
4. SSL certificates
5. Monitoring setup
6. Deploy to Hetzner/cloud

---

## Conclusion

This architecture provides:
- **Platform Independence**: No vendor lock-in, deploy anywhere
- **Performance**: Bun API (3x+ faster) + Astro static pages (CDN-cached)
- **Cost Control**: Self-host for $18/month vs $70+ on managed platforms
- **Type Safety**: Zod + tRPC provides end-to-end types without ORM complexity
- **Flexibility**: Docker means easy scaling and migration
- **Maintainability**: Proper component architecture (Astro + Vue), no raw HTML strings
- **SEO Excellence**: Astro generates perfect static HTML for landing pages

**Key Benefits:**
1. **75%+ cost savings** at scale (self-hosting)
2. **3x+ performance** improvement (Bun API + CDN-cached static pages)
3. **Zero vendor lock-in** (Docker, standard technologies)
4. **Full control** over infrastructure and deployment
5. **Type safety** without ORM overhead
6. **Better DX**: Component-based architecture across all frontends

**Architecture Summary:**
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Landing Pages | Astro (Static) | SEO, CDN-cached, build-time data |
| Admin Dashboard | Vue 3 SPA | Real-time interactions |
| Employee Portal | Vue 3 SPA | Real-time interactions |
| API | Bun + tRPC | Pure API, no SSR responsibility |
| Database | PostgreSQL | Multi-tenant data |
| Cache | Redis | Sessions, rate limiting |

**Next Steps:**
1. Set up Astro project for landing pages
2. Refactor API to remove SSR code (pure API)
3. Build Astro components (HeroSection, ServiceGrid, etc.)
4. Implement rebuild trigger mechanism
5. Set up CDN for static page delivery

---

**Document Version:** 2.1
**Last Updated:** January 2026
**Status:** Ready for Implementation
**Architecture:** Astro Static + Vue SPAs + Bun API, Docker-First, Self-Hostable
