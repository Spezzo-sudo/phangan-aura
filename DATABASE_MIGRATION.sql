-- ============================================
-- DATABASE MIGRATION: Fehlende Felder & Tabellen
-- Phangan Aura - Marktreife Vorbereitung
-- ============================================

-- 1. BOOKINGS TABLE: Fehlende Felder hinzufügen
-- ============================================

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS total_price INTEGER,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card')),
ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS staff_commission INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS transport_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS material_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS company_share INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Kommentar zu Feldern:
-- total_price: Gesamtpreis inkl. Addons
-- payment_method: 'cash' oder 'card'
-- addons: JSON Array mit {id, name, price, quantity}
-- staff_commission: 40% des Gesamtpreises (berechnet)
-- transport_fee: Pauschal 100 THB (berechnet)
-- stripe_fee: 2.9% + 10 THB bei Kartenzahlung (berechnet)
-- material_cost: Kosten für Addons (berechnet)
-- company_share: Rest für Company (berechnet)
-- customer_*: Kontaktdaten für einfachen Zugriff


-- 2. ORDERS TABLE: Komplett neu erstellen (falls nicht vorhanden)
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Order Info
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT DEFAULT 'card' CHECK (payment_method IN ('cash', 'card')),
    
    -- Pricing
    subtotal INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'thb',
    
    -- Customer Info
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT,
    
    -- Items (JSONB Array)
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Stripe Integration
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    
    -- Notes
    notes TEXT,
    delivery_notes TEXT
);

-- Index für schnellere Queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);


-- 3. COMPANY_SETTINGS TABLE: Erstellen (falls nicht vorhanden)
-- ============================================

CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT
);

-- Default Settings einfügen
INSERT INTO company_settings (setting_key, setting_value, description)
VALUES (
    'payment_config',
    '{"enable_stripe": true, "enable_cash": true}'::jsonb,
    'Global payment method configuration'
)
ON CONFLICT (setting_key) DO NOTHING;


-- 4. PRODUCTS TABLE: Erstellen (falls nicht vorhanden für Shop)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    name TEXT NOT NULL,
    description TEXT,
    price_thb INTEGER NOT NULL,
    category TEXT,
    image_url TEXT,
    
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- SEO
    slug TEXT UNIQUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);


-- 5. BOOKINGS TABLE: Indices optimieren
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);


-- 6. TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger für company_settings
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger für products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- FERTIG! 
-- ============================================
-- Nächster Schritt: RLS Policies hinzufügen
-- Siehe: RLS_POLICIES.sql
