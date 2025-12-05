# 🔧 Fix für Sarah Staff Dashboard

## Problem:
Sarah kann sich einloggen, aber sieht keine Buchungen im Staff-Dashboard.

## Ursache:
1. Sarah ist als **User** registriert (`sarah@staff.com`)
2. Sarah hat noch keine **Staff-Rolle** in der Datenbank
3. Buchungen sind **nicht** mit Sarah's ID verknüpft

---

## ✅ LÖSUNG: SQL in Supabase SQL Editor ausführen

### Schritt 1: Sarah zur Staff-Rolle machen

```sql
-- Sarah's E-Mail in Staff-Rolle ändern
UPDATE profiles 
SET role = 'staff' 
WHERE email = 'sarah@staff.com';
```

### Schritt 2: Überprüfen, welche Buchungen existieren

```sql
-- Alle Buchungen anzeigen
SELECT 
    b.id,
    b.customer_id,
    b.staff_id,
    b.status,
    b.start_time,
    p_customer.full_name as customer_name,
    p_customer.email as customer_email,
    p_staff.full_name as staff_name,
    p_staff.email as staff_email,
    s.title as service_title
FROM bookings b
LEFT JOIN profiles p_customer ON b.customer_id = p_customer.id
LEFT JOIN profiles p_staff ON b.staff_id = p_staff.id
LEFT JOIN services s ON b.service_id = s.id
ORDER BY b.created_at DESC
LIMIT 10;
```

### Schritt 3: Buchung an Sarah zuweisen (OPTIONAL)

Wenn eine Buchung existiert, die noch keinen Staff hat oder an Sarah gehen soll:

```sql
-- Buchung an Sarah zuweisen
-- Ersetze <booking-id> mit der tatsächlichen Booking-ID
-- Ersetze <sarah-user-id> mit Sarah's User-ID aus profiles

UPDATE bookings 
SET staff_id = (SELECT id FROM profiles WHERE email = 'sarah@staff.com')
WHERE id = '<booking-id>';
```

### Einfacherer Weg: Alle pending Buchungen Sarah zuweisen

```sql
-- ALLE pending Buchungen an Sarah zuweisen
UPDATE bookings 
SET staff_id = (SELECT id FROM profiles WHERE email = 'sarah@staff.com')
WHERE status = 'pending' 
AND staff_id IS NOT NULL; -- Nur wenn bereits ein Staff zugewiesen ist
```

---

## 🎯 Nach der SQL-Ausführung:

1. ✅ Sarah hat jetzt `role = 'staff'`
2. ✅ Sarah kann auf `/staff` zugreifen
3. ✅ Buchungen sind Sarah zugewiesen
4. ✅ Sarah sieht Buchungen im Dashboard

---

## 🔍 Debugging: Warum ist das passiert?

### Problem im Booking-Flow:
Die Buchung wurde erstellt mit:
- `customer_id`: Max's ID ✅
- `staff_id`: Sarah's Profile-ID (aber Sarah war noch kein Staff!) ❌

### Was ist passiert:
1. Max wählte "Sarah Staff" als Staff-Mitglied
2. System speicherte `staff_id = sarah_profile_id`
3. ABER: Sarah hatte noch `role = 'customer'`, nicht `'staff'`
4. Daher wurde sie vom Staff-Dashboard abgewiesen

### Fix für die Zukunft:
- Staff-Mitglieder müssen VOR dem Booking die richtige Rolle haben
- Oder: Admin muss User zu Staff promoten, bevor sie in Buchungen erscheinen

---

## 📝 Zusammenfassung SQL-Befehle (Copy-Paste):

```sql
-- 1. Sarah zu Staff machen
UPDATE profiles SET role = 'staff' WHERE email = 'sarah@staff.com';

-- 2. Alle Buchungen anzeigen
SELECT b.id, p_customer.full_name as customer, p_staff.full_name as staff, s.title as service
FROM bookings b
LEFT JOIN profiles p_customer ON b.customer_id = p_customer.id
LEFT JOIN profiles p_staff ON b.staff_id = p_staff.id
LEFT JOIN services s ON b.service_id = s.id;

-- 3. Buchung an Sarah zuweisen (falls nötig)
UPDATE bookings 
SET staff_id = (SELECT id FROM profiles WHERE email = 'sarah@staff.com')
WHERE status = 'pending';
```

---

**Nach Ausführung dieser SQL-Befehle sollte Sarah ihre Buchungen sehen können!**
