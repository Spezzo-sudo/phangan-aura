# 🚀 Marktreife Tasks - Phangan Aura

## PHASE 1: KRITISCHE SICHERHEIT & DATEN (PRIO 1)

### ✅ Task 1: Database Schema Update
**Status:** TODO  
**Datei:** `DATABASE_MIGRATION.sql`  
**Beschreibung:**
- [ ] `bookings` Tabelle erweitern (total_price, payment_method, addons, etc.)
- [ ] `orders` Tabelle erstellen (falls nicht vorhanden)
- [ ] `company_settings` Tabelle prüfen/erstellen
- [ ] Alle neuen Felder in `database.ts` Types hinzufügen

**Kritisch weil:** Ohne diese Felder gehen Daten verloren (Commission, Addons, etc.)

---

### ✅ Task 2: Row Level Security (RLS) Policies
**Status:** TODO  
**Dateien:** `RLS_POLICIES.sql`, ggf. bestehende in DB  
**Beschreibung:**
- [ ] `bookings`: User sehen nur eigene, Staff/Admin sehen alle
- [ ] `orders`: User sehen nur eigene, Admin sieht alle
- [ ] `company_settings`: Nur Admin kann ändern, alle können lesen
- [ ] `profiles`: User können nur eigenes Profil ändern
- [ ] `services`: Alle können lesen, nur Admin kann ändern
- [ ] `staff_services`: Nur Staff & Admin können eigene bearbeiten

**Kritisch weil:** Aktuell könnten User fremde Daten sehen/ändern

---

### ✅ Task 3: API Security & Auth
**Status:** TODO  
**Dateien:** 
- `src/app/api/bookings/route.ts`
- `src/app/api/checkout/route.ts`

**Beschreibung:**
- [ ] `/api/bookings` POST: Auth Check hinzufügen
- [ ] `/api/checkout`: Item Price Validation (DB Lookup)
- [ ] Input Sanitization überall
- [ ] Rate Limiting erwägen (Vercel hat das eingebaut)

**Kritisch weil:** Ungeschützte APIs = Sicherheitslücke

---

## PHASE 2: SHOP LOGIC FIX (PRIO 2)

### ✅ Task 4: Shop Cash Payment Logik
**Status:** TODO  
**Dateien:**
- `src/app/checkout/page.tsx`
- `src/app/shop/page.tsx` (optional: Banner)

**Beschreibung:**
- [ ] Shop erlaubt Cash NUR wenn:
  - User hat Booking in nächsten 48h ODER
  - Cash komplett deaktivieren, nur Stripe im Shop
- [ ] Banner im Shop: "Combine with massage booking for free delivery"
- [ ] CartDrawer: Hinweis auf Booking-Kombination

**Kritisch weil:** Aktuelles Konzept macht keinen Sinn (wer liefert?)

---

## PHASE 3: FEHLENDE DASHBOARDS (PRIO 3)

### ✅ Task 5: Orders Dashboard für Admin
**Status:** TODO  
**Dateien:**
- `src/components/admin/OrdersManager.tsx` (NEU)
- `src/app/admin/page.tsx` (Tab hinzufügen)

**Beschreibung:**
- [ ] Komponente erstellen: Alle Orders anzeigen
- [ ] Filter: Status (pending, paid, delivered, cancelled)
- [ ] Actions: Mark as Delivered, Cancel
- [ ] Anzeige: Customer, Items, Total, Payment Method

---

### ✅ Task 6: Staff Dashboard vervollständigen
**Status:** TODO  
**Dateien:**
- `src/app/staff/page.tsx` (prüfen ob existiert)
- Navbar Link hinzufügen

**Beschreibung:**
- [ ] Staff sehen ihre assigned Bookings
- [ ] Filter: Upcoming, Today, Past
- [ ] Actions: Confirm Arrival, Mark Complete, Navigate (Google Maps)
- [ ] Navbar: Staff sehen "My Schedule" Link

---

### ✅ Task 7: Buchhaltung Korrigieren
**Status:** TODO  
**Dateien:**
- `src/components/admin/AccountingDashboard.tsx`
- `src/components/admin/FinanceDashboard.tsx`

**Beschreibung:**
- [ ] Shop Orders in Accounting einbeziehen
- [ ] Addons korrekt berechnen (nicht nur price_snapshot)
- [ ] Stripe Fees separat tracken
- [ ] LoanTracker: Shop Revenue hinzufügen

---

## PHASE 4: UX POLISH (PRIO 4)

### ✅ Task 8: Error Handling & User Feedback
**Status:** TODO  
**Beschreibung:**
- [ ] Toast Notifications statt `alert()` (react-hot-toast?)
- [ ] Loading States überall
- [ ] Bessere Error Messages (nicht "Unknown error")
- [ ] 404 Page
- [ ] 500 Error Page

---

### ✅ Task 9: Input Validation
**Status:** TODO  
**Beschreibung:**
- [ ] Zod Schema für alle Forms
- [ ] Phone Number Format prüfen
- [ ] Email Format prüfen
- [ ] Address Validation

---

## Email-Features (SPÄTER)
- [ ] Booking Confirmation
- [ ] Order Confirmation  
- [ ] Payment Receipts
- [ ] Password Reset

**Hinweis:** Wird aufgeschoben bis Domain/Email konfiguriert ist.

---

## Estimierte Zeit:
- **Phase 1:** ~4-6 Stunden
- **Phase 2:** ~2-3 Stunden  
- **Phase 3:** ~6-8 Stunden
- **Phase 4:** ~3-4 Stunden

**TOTAL:** ~15-21 Stunden (2-3 Arbeitstage)
