-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Phangan Aura - Sicherheit & Datenschutz
-- ============================================

-- WICHTIG: Diese Policies müssen NACH DATABASE_MIGRATION.sql ausgeführt werden!

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users können ihr eigenes Profil sehen
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users können ihr eigenes Profil ändern
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Admins können alle Profile sehen
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins können alle Profile ändern (z.B. Rollen zuweisen)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Neue User können beim Signup ihr Profil erstellen
CREATE POLICY "Users can insert own profile on signup"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


-- ============================================
-- 2. BOOKINGS TABLE
-- ============================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Kunden sehen nur ihre eigenen Bookings
CREATE POLICY "Customers can view own bookings"
ON bookings FOR SELECT
TO authenticated
USING (
    customer_id = auth.uid()
);

-- Policy: Staff sehen ihre assigned Bookings
CREATE POLICY "Staff can view assigned bookings"
ON bookings FOR SELECT
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);

-- Policy: Admins sehen alle Bookings
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Authenticated users können Bookings erstellen
CREATE POLICY "Authenticated users can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

-- Policy: Customers können ihre eigenen Bookings updaten (z.B. canceln via API)
-- Aber nur über API Calls, nicht direkt!
CREATE POLICY "Customers can update own bookings"
ON bookings FOR UPDATE
TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

-- Policy: Staff/Admin können Bookings updaten
CREATE POLICY "Staff and Admin can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);


-- ============================================
-- 3. SERVICES TABLE
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann Services sehen (public read)
CREATE POLICY "Anyone can view active services"
ON services FOR SELECT
TO authenticated, anon
USING (is_active = true OR is_active IS NULL);

-- Policy: Admins können Services verwalten
CREATE POLICY "Admins can manage services"
ON services FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);


-- ============================================
-- 4. STAFF_SERVICES TABLE
-- ============================================

ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann sehen, welcher Staff welche Services anbietet
CREATE POLICY "Anyone can view staff services"
ON staff_services FOR SELECT
TO authenticated, anon
USING (true);

-- Policy: Staff können ihre eigenen Services managen
CREATE POLICY "Staff can manage own services"
ON staff_services FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);


-- ============================================
-- 5. ORDERS TABLE
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users sehen nur ihre eigenen Orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admins sehen alle Orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Authenticated users können Orders erstellen
CREATE POLICY "Authenticated users can create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Admins können Orders updaten (z.B. Status ändern)
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);


-- ============================================
-- 6. COMPANY_SETTINGS TABLE
-- ============================================

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder (authenticated) kann Settings lesen
CREATE POLICY "Anyone can view company settings"
ON company_settings FOR SELECT
TO authenticated, anon
USING (true);

-- Policy: Nur Admins können Settings ändern
CREATE POLICY "Admins can update company settings"
ON company_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins können neue Settings erstellen
CREATE POLICY "Admins can insert company settings"
ON company_settings FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);


-- ============================================
-- 7. PRODUCTS TABLE
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann aktive Produkte sehen
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
TO authenticated, anon
USING (is_active = true OR is_active IS NULL);

-- Policy: Admins können Produkte verwalten
CREATE POLICY "Admins can manage products"
ON products FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);


-- ============================================
-- 8. AVAILABILITY & BLOCKERS TABLES
-- ============================================

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockers ENABLE ROW LEVEL SECURITY;

-- Availability policies
CREATE POLICY "Anyone can view availability"
ON availability FOR SELECT
TO authenticated, anon
USING (is_active = true OR is_active IS NULL);

CREATE POLICY "Staff can manage own availability"
ON availability FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Blockers policies
CREATE POLICY "Staff and admin can view blockers"
ON blockers FOR SELECT
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);

CREATE POLICY "Staff can manage own blockers"
ON blockers FOR ALL
TO authenticated
USING (
    staff_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);


-- ============================================
-- FERTIG!
-- ============================================
-- Diese Policies schützen alle Tabellen vor unbefugtem Zugriff.
-- 
-- WICHTIG: Teste alle Endpoints mit verschiedenen User-Rollen!
-- 
-- Nächster Schritt: API Security (Auth Checks in Routes)
