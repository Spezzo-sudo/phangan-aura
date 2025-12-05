-- ============================================
-- DATABASE MIGRATION (SAFE VERSION)
-- Nur fehlende Felder hinzufügen, keine Tabellen neu erstellen
-- ============================================

-- 1. BOOKINGS TABLE: Fehlende Felder hinzufügen (SAFE)
-- ============================================

DO $$ 
BEGIN
    -- total_price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='total_price') THEN
        ALTER TABLE bookings ADD COLUMN total_price INTEGER;
    END IF;

    -- payment_method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='payment_method') THEN
        ALTER TABLE bookings ADD COLUMN payment_method TEXT DEFAULT 'cash' 
        CHECK (payment_method IN ('cash', 'card'));
    END IF;

    -- addons
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='addons') THEN
        ALTER TABLE bookings ADD COLUMN addons JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- staff_commission
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='staff_commission') THEN
        ALTER TABLE bookings ADD COLUMN staff_commission INTEGER DEFAULT 0;
    END IF;

    -- transport_fee
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='transport_fee') THEN
        ALTER TABLE bookings ADD COLUMN transport_fee INTEGER DEFAULT 0;
    END IF;

    -- stripe_fee
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='stripe_fee') THEN
        ALTER TABLE bookings ADD COLUMN stripe_fee INTEGER DEFAULT 0;
    END IF;

    -- material_cost
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='material_cost') THEN
        ALTER TABLE bookings ADD COLUMN material_cost INTEGER DEFAULT 0;
    END IF;

    -- company_share
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='company_share') THEN
        ALTER TABLE bookings ADD COLUMN company_share INTEGER DEFAULT 0;
    END IF;

    -- customer_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='customer_name') THEN
        ALTER TABLE bookings ADD COLUMN customer_name TEXT;
    END IF;

    -- customer_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='customer_email') THEN
        ALTER TABLE bookings ADD COLUMN customer_email TEXT;
    END IF;

    -- customer_phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='customer_phone') THEN
        ALTER TABLE bookings ADD COLUMN customer_phone TEXT;
    END IF;
END $$;


-- 2. ORDERS TABLE: Fehlende Felder hinzufügen (falls Tabelle existiert)
-- ============================================

DO $$
BEGIN
    -- Prüfen ob orders Tabelle existiert
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders') THEN
        
        -- order_number
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='order_number') THEN
            ALTER TABLE orders ADD COLUMN order_number TEXT;
            -- Index hinzufügen
            CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
        END IF;

        -- payment_method
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='payment_method') THEN
            ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'card' 
            CHECK (payment_method IN ('cash', 'card'));
        END IF;

        -- delivery_notes
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='orders' AND column_name='delivery_notes') THEN
            ALTER TABLE orders ADD COLUMN delivery_notes TEXT;
        END IF;

    ELSE
        -- Tabelle existiert nicht, komplett neu erstellen
        CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            
            order_number TEXT UNIQUE NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'delivered', 'cancelled')),
            payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
            payment_method TEXT DEFAULT 'card' CHECK (payment_method IN ('cash', 'card')),
            
            subtotal INTEGER NOT NULL,
            total_amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'thb',
            
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            shipping_address TEXT,
            
            items JSONB NOT NULL DEFAULT '[]'::jsonb,
            
            stripe_session_id TEXT,
            stripe_payment_intent_id TEXT,
            
            notes TEXT,
            delivery_notes TEXT
        );

        -- Indices
        CREATE INDEX idx_orders_user_id ON orders(user_id);
        CREATE INDEX idx_orders_status ON orders(status);
        CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
        CREATE INDEX idx_orders_order_number ON orders(order_number);

        -- Trigger
        CREATE TRIGGER update_orders_updated_at
            BEFORE UPDATE ON orders
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;


-- 3. COMPANY_SETTINGS TABLE
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

-- Trigger
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 4. PRODUCTS TABLE (falls noch nicht vorhanden)
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
    
    slug TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Trigger
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 5. BOOKINGS TABLE: Indices optimieren
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);


-- 6. TRIGGER FUNCTION: update_updated_at_column
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- FERTIG! 
-- ============================================
-- Hinweis: Diese Migration ist sicher und kann mehrfach ausgeführt werden.
