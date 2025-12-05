# 🐛 BEKANNTE PROBLEME & STATUS

**Stand:** 01.12.2025 20:45

---

## ✅ GELÖST

- ✅ RLS Policies blockierten Login → GELÖST (korrekte Policies)
- ✅ Services nicht sichtbar → GELÖST (is_active IS NOT FALSE)
- ✅ Shop Cash Payment Konzept → GELÖST (nur Stripe im Shop)
- ✅ Database Schema → GELÖST (alle Felder vorhanden)

---

## ⚠️ BEKANNTE BUGS

### 1. Cancel Booking "Not Found" Error
**Status:** Debugging läuft  
**Problem:** API findet Booking nicht (RLS oder ID Problem?)  
**Fix:** Besseres Error Logging hinzugefügt  
**Test:** Nochmal im Browser testen und Konsole checken

### 2. TypeScript Lint Errors
**Status:** Kosmetisch, funktioniert aber  
**Probleme:**
- `Property 'total_price' does not exist on type 'Booking'` in BookingCard
- `Property 'price_thb' does not exist on type 'CartItem'` in Checkout
- `Property 'redirectToCheckout' does not exist on type 'Stripe'` (Alte Stripe API)

**Impact:** LOW - Code läuft, nur TS meckert  
**Fix:** Types in `database.ts` sind aktuell, aber Import in Components nicht

---

## 🚧 FEHLENDE FEATURES

### 1. Orders Dashboard (Admin)
**Status:** TODO  
**Was fehlt:**
- Admin kann Shop-Bestellungen nicht sehen
- Keine Order Management UI
- Status Updates fehlen (Delivered, etc.)

**Impact:** MEDIUM - Shop funktioniert, aber Admin hat keine Übersicht

---

### 2. Staff Dashboard
**Status:** TODO  
**Was fehlt:**
- Staff sehen ihre assigned Bookings nicht
- Keine "My Schedule" Seite
- Kein Navigation zu Google Maps

**Impact:** MEDIUM - Staff müssen Admin Dashboard nutzen

---

### 3. Buchhaltung / Accounting
**Status:** KRITISCH  
**Probleme:**
- AccountingDashboard nutzt alte Felder (`price_snapshot` statt `total_price`)
- Shop Orders fehlen komplett in Accounting
- Addons werden nicht korrekt berechnet
- Commission Breakdown stimmt nicht

**Impact:** HIGH - Finanz-Tracking ist falsch!

**Betroffene Dateien:**
- `src/components/admin/AccountingDashboard.tsx`
- `src/components/admin/FinanceDashboard.tsx`
- `src/components/admin/LoanTracker.tsx` (falls vorhanden)

---

### 4. Stripe Webhooks
**Status:** FEHLT  
**Problem:**
- Keine automatische Order Status Updates nach Payment
- Kein "Paid" Status Update
- Revenue wird nicht automatisch getrackt

**Impact:** HIGH - Manuelle Nacharbeit nötig

---

### 5. Email Notifications
**Status:** AUFGESCHOBEN  
**Grund:** Keine Domain/Email Setup  
**Was fehlt:**
- Booking Confirmations
- Order Confirmations
- Payment Receipts

**Impact:** MEDIUM - Kann später nachgerüstet werden

---

### 6. Input Validation
**Status:** TODO  
**Was fehlt:**
- Zod Schemas für Forms
- Phone Number Format Checks
- Email Validation
- Price Validation in `/api/checkout`

**Impact:** MEDIUM - Security Risiko

---

### 7. Error Handling / Toast Notifications
**Status:** TODO  
**Probleme:**
- Überall `alert()` statt schöne Toast Messages
- Keine Loading States manchmal
- Error Messages zu generisch

**Impact:** LOW - UX Problem, kein Funktionsproblem

---

## 🎯 PRIORITÄTEN FÜR MARKTREIFE

### MUST HAVE (KRITISCH):
1. **Buchhaltung korrigieren** - Sonst stimmen Finanzen nicht!
2. **Stripe Webhooks** - Sonst müssen Orders manuell bestätigt werden
3. **Orders Dashboard** - Admin muss Shop-Bestellungen sehen können

### SHOULD HAVE (WICHTIG):
4. **Staff Dashboard** - Bessere UX für Staff
5. **Input Validation** - Security
6. **Error Handling** - Bessere UX

### NICE TO HAVE (SPÄTER):
7. **Email Notifications** - Braucht Domain Setup
8. **TypeScript Fixes** - Kosmetisch

---

## 🧪 TESTING CHECKLISTE

**Teste folgende Flows:**

- [ ] Booking erstellen (Cash)
- [ ] Booking erstellen (Card - ohne tatsächliche Zahlung)
- [ ] Booking canceln
- [ ] Shop Order erstellen (nur Stripe)
- [ ] Admin: Booking confirm
- [ ] Admin: Booking complete
- [ ] Admin: Settings ändern
- [ ] Staff: Kann assigned Bookings sehen? (NEIN - fehlt)
- [ ] Accounting: Zeigt korrekte Commission? (NEIN - falsch berechnet)

---

## 📊 GESCHÄTZTE ENTWICKLUNGSZEIT

| Task | Zeit | Priorität |
|------|------|-----------|
| Buchhaltung Fix | 3-4h | CRITICAL |
| Stripe Webhooks | 2-3h | HIGH |
| Orders Dashboard | 3-4h | HIGH |
| Staff Dashboard | 2-3h | MEDIUM |
| Input Validation | 2-3h | MEDIUM |
| Error Handling | 1-2h | LOW |
| **TOTAL** | **13-19h** | |

**Realistische Marktreife:** 2-3 Arbeitstage (ohne Emails)

---

## 🤔 OFFENE FRAGEN

1. **Sollen wir TypeScript Errors fixen?** (Low Prio, aber nervig)
2. **Brauchen wir Real-time Updates** (Supabase Subscriptions)?
3. **Wann kommt Domain/Email** Setup?
4. **Soll Staff Dashboard jetzt gemacht werden** oder später?

---

**Was soll als nächstes gemacht werden?**
