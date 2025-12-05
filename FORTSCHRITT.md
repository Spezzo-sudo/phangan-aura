# 🎯 FORTSCHRITT: Marktreife Tasks

**Datum:** 01.12.2025  
**Status:** Phase 1 & 2 ABGESCHLOSSEN ✅

---

## ✅ PHASE 1: KRITISCHE SICHERHEIT & DATEN (FERTIG)

### ✅ Task 1: Database Schema Update
**Dateien erstellt:**
- `DATABASE_MIGRATION.sql` - SQL Script zum Ausführen in Supabase
- `src/types/database.ts` - TypeScript Types aktualisiert

**Was wurde gemacht:**
- `bookings` Tabelle erweitert: total_price, payment_method, addons, staff_commission, transport_fee, stripe_fee, material_cost, company_share, customer_name/email/phone
- `orders` Tabelle komplett neu erstellt
- `company_settings` Tabelle erstellt
- `products` Tabelle erstellt
- Alle Indices und Triggers hinzugefügt
- `src/app/api/bookings/route.ts` aktualisiert um alle neuen Felder zu speichern

**WICHTIG FÜR DEN USER:**
```sql
-- In Supabase SQL Editor ausführen:
DATABASE_MIGRATION.sql
```

---

### ✅ Task 2: Row Level Security (RLS) Policies
**Datei erstellt:**
- `RLS_POLICIES.sql` - Komplett

e RLS Policies für alle Tabellen

**Was wurde gemacht:**
- Policies für `profiles`, `bookings`, `services`, `staff_services`
- Policies für `orders`, `company_settings`, `products`
- Policies für `availability`, `blockers`
- Role-based Access Control (admin, staff, customer)

**WICHTIG FÜR DEN USER:**
```sql
-- NACH DATABASE_MIGRATION.sql ausführen:
RLS_POLICIES.sql
```

---

### ⚠️ Task 3: API Security & Auth
**Status:** TEILWEISE - Noch zu tun!
**Was fehlt:**
- Input Validation (Zod Schemas)
- Price Validation in `/api/checkout` (DB Lookup)
- Rate Limiting (optional, Vercel hat das)

---

## ✅ PHASE 2: SHOP LOGIC FIX (FERTIG)

### ✅ Task 4: Shop Cash Payment Logik
**Dateien geändert:**
- `src/app/checkout/page.tsx` - Cash deaktiviert, nur Stripe erlaubt
- Info-Banner hinzugefügt: "Book a massage for cash payment"

**Konzept:**
- **Standalone Shop:** Nur Kreditkarte (Stripe)
- **Shop via Booking Wizard Addons:** Cash erlaubt (mit Massage-Buchung)

---

## 🚧 PHASE 3: FEHLENDE DASHBOARDS (TODO)

### ⏳ Task 5: Orders Dashboard für Admin
**Status:** TODO  
**Plan:**
- Komponente `src/components/admin/OrdersManager.tsx` erstellen
- In `src/app/admin/page.tsx` als Tab einbinden
- Features: Alle Orders anzeigen, Status ändern, Delivered markieren

---

### ⏳ Task 6: Staff Dashboard vervollständigen
**Status:** TODO  
**Plan:**
- `src/app/staff/page.tsx` erstellen (falls nicht vorhanden)
- Staff sehen ihre assigned Bookings
- Filter: Upcoming, Today, Past
- Navigation to Customer (Google Maps Link)

---

### ⏳ Task 7: Buchhaltung Korrigieren
**Status:** TODO  
**Probleme:**
- `AccountingDashboard` rechnet Addons NICHT mit
- Shop Orders fehlen komplett
- Nutzt nur `price_snapshot` (alt)

**Lösung:**
- `total_price`, `staff_commission`, `company_share` nutzen
- Shop Orders aus `orders` Tabelle einbeziehen

---

## 📊 ZUSAMMENFASSUNG

**Erledigt:**
- ✅ Database Schema komplett überarbeitet
- ✅ RLS Policies für alle Tabellen
- ✅ Shop Cash Payment deaktiviert (nur Stripe)
- ✅ Booking API speichert alle Accounting-Felder

**Noch zu tun:**
- ⏳ Orders Dashboard (Admin)
- ⏳ Staff Dashboard
- ⏳ Buchhaltung korrigieren
- ⏳ Input Validation
- ⏳ Error Handling / Toast Notifications

**Geschätzte Restzeit:** ~8-10 Stunden

---

## 🚀 NÄCHSTER SCHRITT

1. **User muss SQL ausführen:**
   ```
   1. DATABASE_MIGRATION.sql
   2. RLS_POLICIES.sql
   ```

2. **Danach weiter mit:**
   - Task 5: Orders Dashboard
   - Task 6: Staff Dashboard  
   - Task 7: Buchhaltung

**Frage an User:** Soll ich mit den Dashboards weitermachen?
