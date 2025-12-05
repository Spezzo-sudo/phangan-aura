# 🛠️ Fix: Staff Permissions (RLS Policies)

Das Problem "500 Internal Server Error" beim Akzeptieren/Ablehnen von Buchungen liegt daran, dass Staff-Mitglieder keine Schreibrechte auf die `bookings` Tabelle haben.

Bitte führe folgenden SQL-Code im **Supabase SQL Editor** aus, um das zu beheben:

```sql
-- 1. Policy: Staff darf eigene Buchungen sehen (falls noch nicht vorhanden)
CREATE POLICY "Staff can view own bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  auth.uid() = staff_id
);

-- 2. Policy: Staff darf Status eigener Buchungen ändern
CREATE POLICY "Staff can update own bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
  auth.uid() = staff_id
)
WITH CHECK (
  auth.uid() = staff_id
);
```

---

## 🔍 Überprüfung

Nachdem du das SQL ausgeführt hast:
1. Gehe zurück ins Staff Dashboard (`/staff`).
2. Versuche erneut, eine Buchung zu bestätigen ("Confirm").
3. Es sollte jetzt funktionieren!
