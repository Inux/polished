-- Migration: 001_create_core_tables
-- Created: 2026-01-17
-- Description: Core tables for Polished multi-tenant booking platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- STUDIOS (Tenants)
-- ============================================================================
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

  -- Owner (references users, but created first due to circular dependency)
  owner_id TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_studios_subdomain ON studios(subdomain);
CREATE INDEX idx_studios_custom_domain ON studios(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_studios_owner ON studios(owner_id);

-- ============================================================================
-- USERS (Multi-role: Owner, Employee, Customer)
-- ============================================================================
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL for social login or guest customers
  name TEXT NOT NULL,
  phone TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Add foreign key constraint now that users table exists
ALTER TABLE studios ADD CONSTRAINT fk_studios_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT;

-- ============================================================================
-- EMPLOYEES
-- ============================================================================
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

  buffer_time INTEGER NOT NULL DEFAULT 15, -- minutes between appointments

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (studio_id, user_id)
);

CREATE INDEX idx_employees_studio ON employees(studio_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_active ON employees(studio_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- SERVICES
-- ============================================================================
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
CREATE INDEX idx_services_category ON services(studio_id, category);
CREATE INDEX idx_services_active ON services(studio_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- EMPLOYEE_SERVICES (Junction table with pricing per employee)
-- ============================================================================
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

-- ============================================================================
-- BOOKINGS
-- ============================================================================
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

  -- Customer Info (for non-registered or guest users)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- WhatsApp tracking
  whatsapp_message_id TEXT,
  whatsapp_status TEXT,

  -- Pricing (snapshot at booking time)
  price DECIMAL(10, 2) NOT NULL,

  -- Notes
  notes TEXT,
  private_notes TEXT, -- Employee-only notes

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: Prevent overlapping bookings for same employee
  EXCLUDE USING GIST (
    employee_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status NOT IN ('CANCELLED', 'DECLINED'))
);

CREATE INDEX idx_bookings_studio_time ON bookings(studio_id, start_time);
CREATE INDEX idx_bookings_employee_time ON bookings(employee_id, start_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_upcoming ON bookings(studio_id, start_time, status)
  WHERE status IN ('PENDING', 'CONFIRMED');

-- ============================================================================
-- MIGRATIONS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_studios_updated_at BEFORE UPDATE ON studios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_services_updated_at BEFORE UPDATE ON employee_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
