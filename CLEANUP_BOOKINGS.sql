-- ============================================
-- CLEANUP: Alle Test-Buchungen löschen
-- NUR für Development/Testing!
-- ============================================

-- WARNUNG: Dies löscht ALLE Buchungen und Orders!
-- Profiles, Services, Products bleiben erhalten.

-- 1. Alle Bookings löschen
DELETE FROM bookings;

-- 2. Alle Orders löschen (falls Tabelle existiert)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders') THEN
        DELETE FROM orders;
    END IF;
END $$;

-- 3. Sequences zurücksetzen (falls vorhanden)
-- Nicht nötig bei UUID Primary Keys

-- ============================================
-- OPTIONAL: Auch Blockers löschen?
-- ============================================
-- Uncomment if needed:
-- DELETE FROM blockers;

-- ============================================
-- FERTIG!
-- ============================================
-- Die Datenbank ist jetzt "frisch" für neue Tests.
-- Profiles, Services, Staff bleiben erhalten.

SELECT 
    'Bookings deleted' as status,
    (SELECT COUNT(*) FROM bookings) as remaining_bookings,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM services) as services_count;
