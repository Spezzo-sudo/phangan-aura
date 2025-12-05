# 🛠️ Fix: Upsell Support (Add 'addons' column)

Damit wir Zusatzleistungen (wie "Coconut Oil") speichern können, müssen wir die `bookings` Tabelle erweitern.

Bitte führe folgenden SQL-Code im **Supabase SQL Editor** aus:

```sql
-- 1. Add JSONB column for addons
ALTER TABLE bookings 
ADD COLUMN addons JSONB DEFAULT '[]'::jsonb;

-- 2. Update RLS policies to allow reading/writing this column (usually automatic, but good to check)
-- (No extra action needed if policies are on the table level)
```

---

## 🔍 Überprüfung

Nachdem du das SQL ausgeführt hast:
1. Gehe in den Table Editor -> `bookings`.
2. Du solltest eine neue Spalte `addons` sehen.
