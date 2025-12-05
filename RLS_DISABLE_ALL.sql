-- ============================================
-- EMERGENCY ROLLBACK: RLS KOMPLETT DEAKTIVIEREN
-- Dies deaktiviert temporär ALLE RLS Policies
-- ============================================

-- SOFORT ausführen um die App wieder zum Laufen zu bringen!

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE blockers DISABLE ROW LEVEL SECURITY;

-- Falls diese Tabellen existieren:
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders') THEN
        ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='company_settings') THEN
        ALTER TABLE company_settings DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='products') THEN
        ALTER TABLE products DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- WICHTIG:
-- Nach diesem Script sollte ALLES wieder funktionieren.
-- Die App ist dann aber UNGESCHÜTZT!
-- Nur für Development/Testing verwenden!
-- ============================================
