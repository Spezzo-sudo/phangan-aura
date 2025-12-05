-- ==============================================================================
-- PHASE 2: INTERNATIONALIZATION (i18n) - DATABASE CONTENT
-- Description: Convert text columns to JSONB to store multi-language content.
-- ==============================================================================

-- 1. SERVICES TABLE
-- ------------------------------------------------------------------------------
-- Fix: Add missing updated_at column if it doesn't exist (just in case)
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Disable user-defined triggers temporarily (avoids permission error on system triggers)
ALTER TABLE services DISABLE TRIGGER USER;

-- A. Title
ALTER TABLE services ADD COLUMN IF NOT EXISTS title_i18n JSONB;
UPDATE services SET title_i18n = jsonb_build_object('en', title) WHERE title_i18n IS NULL;
-- Only drop if the new column is populated (safety check implied by flow, but we force it)
ALTER TABLE services DROP COLUMN IF EXISTS title;
ALTER TABLE services RENAME COLUMN title_i18n TO title;

-- B. Description
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_i18n JSONB;
UPDATE services SET description_i18n = jsonb_build_object('en', description) WHERE description_i18n IS NULL;
ALTER TABLE services DROP COLUMN IF EXISTS description;
ALTER TABLE services RENAME COLUMN description_i18n TO description;

-- Re-enable triggers
ALTER TABLE services ENABLE TRIGGER USER;


-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
-- Fix: Add missing updated_at column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Disable user-defined triggers temporarily
ALTER TABLE products DISABLE TRIGGER USER;

-- A. Name
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_i18n JSONB;
UPDATE products SET name_i18n = jsonb_build_object('en', name) WHERE name_i18n IS NULL;
ALTER TABLE products DROP COLUMN IF EXISTS name;
ALTER TABLE products RENAME COLUMN name_i18n TO name;

-- B. Description
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_i18n JSONB;
UPDATE products SET description_i18n = jsonb_build_object('en', description) WHERE description_i18n IS NULL;
ALTER TABLE products DROP COLUMN IF EXISTS description;
ALTER TABLE products RENAME COLUMN description_i18n TO description;

-- Re-enable triggers
ALTER TABLE products ENABLE TRIGGER USER;


-- 3. COMPANY SETTINGS (Optional but good practice)
-- ------------------------------------------------------------------------------
-- If settings have user-facing text, they should also be JSONB.
-- Currently 'setting_value' is already JSON, so we are good there.

