-- ============================================
-- EMERGENCY FIX: RLS Policies lockern
-- Temporär alle Policies auf "offen" setzen zum Debuggen
-- ============================================

-- 1. SERVICES: Alle sichtbar (vorher nur is_active=true)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
DROP POLICY IF EXISTS "Anyone can view all services" ON services;

CREATE POLICY "Anyone can view all services"
ON services FOR SELECT
TO authenticated, anon
USING (true);


-- 2. PRODUCTS: Alle sichtbar (vorher nur is_active=true)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Anyone can view all products" ON products;

CREATE POLICY "Anyone can view all products"
ON products FOR SELECT
TO authenticated, anon
USING (true);


-- 3. AVAILABILITY: Alle sichtbar (vorher nur is_active=true)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view availability" ON availability;
DROP POLICY IF EXISTS "Anyone can view all availability" ON availability;

CREATE POLICY "Anyone can view all availability"
ON availability FOR SELECT
TO authenticated, anon
USING (true);


-- ============================================
-- HINWEIS:
-- Diese Policies sind TEMPORÄR zu weit offen.
-- Nachdem alles funktioniert, sollten wir sie wieder einschränken.
-- Aber erstmal muss die App laufen!
-- ============================================
