# 🔍 Phangan Aura - Projekt-Initialisierung & Status-Report
*Erstellt am: 30. November 2025*

---

## 📊 Executive Summary

**Projekt:** Phangan Aura - Premium Mobile Wellness Booking Platform  
**Tech-Stack:** Next.js 16.0.5, React 19.2.0, Supabase, Tailwind CSS 4, Zustand, Framer Motion  
**Status:** ⚠️ **Funktionsfähig mit kritischen Problemen**

### Hauptbefunde:
- ✅ **Dev-Server läuft** auf `http://localhost:3000`
- ✅ **Basis-Features funktionieren** (Homepage, Auth, Admin-Dashboard)
- ❌ **24 ESLint-Fehler** (kritisch, vor allem in Booking-Komponenten)
- ❌ **Booking-Flow defekt** (Step 2 leer, Staff-Service-Mapping fehlt)
- ⚠️ **20 ESLint-Warnungen** (React Hooks, Image-Optimierung)

---

## 🏗️ Projektstruktur

```
phangan-aura/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── book/              # Booking Wizard
│   │   ├── admin/             # Admin Dashboard
│   │   ├── login/             # Auth Pages
│   │   ├── register/
│   │   ├── profile/
│   │   ├── services/
│   │   ├── shop/
│   │   └── staff/
│   ├── components/            # React Components
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── booking/           # Booking Wizard Steps
│   │   │   ├── BookingWizard.tsx
│   │   │   ├── StepService.tsx
│   │   │   ├── StepStaff.tsx
│   │   │   ├── StepDateTime.tsx
│   │   │   ├── StepLocation.tsx
│   │   │   └── StepConfirm.tsx
│   │   └── admin/
│   ├── lib/
│   │   ├── store.ts           # Zustand State Management
│   │   ├── mock-data.ts       # Mock-Daten
│   │   ├── utils.ts
│   │   └── supabase/          # DB Clients
│   └── types/
│       └── database.ts        # Supabase Typen
├── public/
├── .env.local                 # Supabase Credentials (gitignored)
└── package.json
```

---

## 🗄️ Datenbank-Schema (Supabase)

### Tabellen:
1. **`profiles`** (User-Accounts)
   - Rollen: `customer`, `staff`, `admin`
   - Felder: email, full_name, avatar_url, bio, phone
   
2. **`services`** (Leistungen)
   - Kategorien: `massage`, `nails`, `beauty`
   - Felder: title, description, category, duration_min, price_thb, image_url
   
3. **`staff_services`** (Viele-zu-Viele: Welcher Staff macht welchen Service?)
   - **🚨 KRITISCH:** Diese Tabelle ist leer! → Booking Step 2 zeigt keine Mitarbeiter an.
   
4. **`bookings`** (Buchungen)
   - Status: `pending`, `confirmed`, `completed`, `cancelled`
   - Felder: customer_id, staff_id, service_id, start_time, end_time, location_*, notes
   
5. **`availability`** (Staff-Verfügbarkeit)
   - Felder: staff_id, day_of_week, start_time, end_time
   
6. **`blockers`** (Urlaub/Auszeiten)

---

## ⚠️ KRITISCHE PROBLEME (Müssen behoben werden!)

### 🔴 1. ESLint-Fehler (24 Stück)

#### **A) Variable Access Before Declaration** (3 Fehler)
**Dateien:**
- `StepService.tsx` (Zeile 52): `fetchServices` vor Deklaration verwendet
- `StepStaff.tsx` (Zeile 20): `fetchStaffForService` vor Deklaration verwendet
- `StepLocation.tsx` (Zeile 193): `fetchDefaultAddress` vor Deklaration verwendet

**Problem:** `useEffect` ruft Funktion auf, die erst danach definiert wird.

**Fix:** Funktion VOR `useEffect` verschieben oder `useCallback` verwenden.

```typescript
// ❌ FALSCH:
useEffect(() => {
    fetchServices(category);
}, [category]);

const fetchServices = async (cat: string) => { ... };

// ✅ RICHTIG:
const fetchServices = useCallback(async (cat: string) => { ... }, []);

useEffect(() => {
    if (category) fetchServices(category);
}, [category, fetchServices]);
```

---

#### **B) TypeScript `any` Typ** (9 Fehler)
**Dateien:**
- `Navbar.tsx`: 6 Fehler (User-Objekt, Supabase-Auth-Response)
- `StepService.tsx`: 2 Fehler
- `AdminDashboard.tsx`: 1 Fehler

**Fix:** Explizite Typen aus `database.ts` verwenden:
```typescript
// ❌ FALSCH:
const user: any = ...

// ✅ RICHTIG:
import { Database } from '@/types/database';
type Profile = Database['public']['Tables']['profiles']['Row'];
const user: Profile | null = ...
```

---

#### **C) React Hooks Exhaustive Deps** (12 Warnungen)
**Problem:** `useEffect` Dependencies unvollständig → Potentielle Bugs bei State-Updates.

**Fix:** Entweder Dependencies ergänzen ODER `useCallback` für Funktionen.

---

### 🔴 2. Booking Flow defekt

**Problem:** Step 2 (Staff-Auswahl) ist leer.  
**Ursache:** Keine Einträge in `staff_services` Tabelle in Supabase.

**Impact:** User können KEINE Buchungen abschließen!

**Screenshot-Beweis:**
- Homepage lädt korrekt
- `/book` zeigt Step 3 (DateTime) → User ist "gefangen", kann nicht zu Step 1 zurück
- Service-Auswahl funktioniert (lädt aus DB)

**Fix (2 Optionen):**

A) **Admin-UI** zum Zuweisen von Services zu Staff-Mitgliedern:
```typescript
// In AdminDashboard: Staff-Services verknüpfen
await supabase
  .from('staff_services')
  .insert({ staff_id: 'xyz', service_id: 'abc' });
```

B) **Seed-Script** für Entwicklung:
```sql
-- In Supabase SQL Editor
INSERT INTO staff_services (staff_id, service_id)
SELECT p.id, s.id 
FROM profiles p, services s 
WHERE p.role = 'staff' AND s.category = 'massage'
LIMIT 3;
```

---

### 🔴 3. Navbar: Login-Status fehlt

**Problem:** Navbar zeigt Login/Logout nicht korrekt (laut `PROJECT_STATUS.md`).  
**Lösung:** Navbar muss Supabase Auth-Status abfragen und User-Menü anzeigen.

---

## ⚠️ Moderate Probleme

### 🟡 1. Image-Optimierung
- 1 Warnung: `StepStaff.tsx` verwendet `<img>` statt `next/image`
- **Fix:** `import Image from 'next/image'` und `<Image />` verwenden

### 🟡 2. Mock-Daten
`lib/mock-data.ts` enthält noch Mock-Daten für:
- Services (sollten aus DB kommen → **bereits implementiert**)
- Staff (sollten aus DB kommen → **bereits implementiert**)
- Produkte (Shop) → **noch nicht in DB**

### 🟡 3. Dependencies veraltet
```
baseline-browser-mapping is over two months old
```
**Fix:** `npm i baseline-browser-mapping@latest -D`

---

## ✅ Was bereits funktioniert

### 1. **Authentifizierung**
- ✅ Login-Seite (`/login`)
- ✅ Register-Seite (`/register`)
- ✅ Supabase Auth Integration

### 2. **Admin-Dashboard**
- ✅ User-Liste anzeigen
- ✅ Rollen ändern (zu Staff/Admin promoten)
- ✅ Service-Seeding (Default-Services in DB einfügen)

### 3. **Booking Wizard**
- ✅ Step 1: Service-Auswahl (lädt aus DB!)
- ❌ Step 2: Staff-Auswahl (leer, Bug!)
- ✅ Step 3: Datum/Zeit (UI funktioniert)
- ✅ Step 4: Location (Google Maps Integration)
- ✅ Step 5: Bestätigung

### 4. **Design System**
- ✅ "Aura" Theme (Teal/Sand/Gold)
- ✅ Google Fonts: Playfair Display (Serif), Outfit (Sans)
- ✅ Glassmorphism-Effekte
- ✅ Framer Motion Animationen
- ✅ Tailwind CSS 4 Setup

### 5. **Datenbank-Integration**
- ✅ Supabase Client (Server + Browser)
- ✅ TypeScript Typen generiert (`database.ts`)
- ✅ Services werden aus `services` Tabelle geladen

---

## 📋 TODO-Liste (Priorisiert)

### 🔥 **URGENT (Kritisch für Funktion)**
1. [ ] **ESLint-Fehler beheben** (24 Stück)
   - [ ] `StepService.tsx`: `fetchServices` vor declaration
   - [ ] `StepStaff.tsx`: `fetchStaffForService` vor declaration  
   - [ ] `StepLocation.tsx`: `fetchDefaultAddress` vor declaration
   - [ ] TypeScript `any` durch explizite Typen ersetzen (9 Stellen)
   
2. [ ] **Staff-Service-Mapping** (Booking Step 2 reparieren)
   - [ ] Admin-UI: Staff-Mitgliedern Services zuweisen
   - [ ] ODER: SQL Seed-Script für Dev-Daten
   
3. [ ] **Navbar Login-Status**
   - [ ] Supabase Auth-Status abrufen
   - [ ] User-Menü mit Logout anzeigen

### ⚡ **HIGH (Wichtig für Launch)**
4. [ ] **Booking Wizard Schritt 3 vervollständigen**
   - [ ] Zeitslots aus Staff-Availability berechnen
   - [ ] Gebuchte Zeiten ausblenden (aus `bookings`)
   
5. [ ] **Booking Confirmation**
   - [ ] Daten in `bookings` Tabelle speichern
   - [ ] Erfolgsmeldung anzeigen
   
6. [ ] **Staff Dashboard** (`/staff`)
   - [ ] Eigene Buchungen anzeigen
   - [ ] Profil bearbeiten
   - [ ] Verfügbarkeit setzen

7. [ ] **User Profile** (`/profile`)
   - [ ] Eigene Buchungen anzeigen
   - [ ] Buchungen stornieren

### 🟢 **MEDIUM (Nice-to-Have)**
8. [ ] **E-Mail-Benachrichtigungen**
   - [ ] Resend Integration
   - [ ] Bestätigungs-E-Mails
   
9. [ ] **Shop-Funktionalität**
   - [ ] `products` Tabelle in Supabase
   - [ ] Warenkorb-Logik
   
10. [ ] **Performance-Optimierung**
    - [ ] `next/image` statt `<img>`
    - [ ] React Hooks Dependencies korrigieren

---

## 🔧 Sofort-Empfehlungen

### 1. ESLint-Fehler beheben (15 Min)
```bash
# In VS Code: Problems-Panel öffnen
# Jede Datei durchgehen und Funktionen vor useEffect verschieben
```

### 2. Staff-Service-Verknüpfung herstellen (5 Min)
**Option A (schnell, für Tests):**
```sql
-- In Supabase SQL Editor ausführen:
-- Findet ersten Staff mit Rolle 'staff'
-- und verknüpft mit allen Massage-Services
INSERT INTO staff_services (staff_id, service_id)
SELECT 
    (SELECT id FROM profiles WHERE role = 'staff' LIMIT 1) as staff_id,
    id as service_id
FROM services 
WHERE category = 'massage';
```

**Option B (nachhaltig):**
Admin-Dashboard erweitern mit Staff-Service-Management-UI.

### 3. Build-Test durchführen
```bash
npm run build
# Prüfen ob Production-Build durchläuft
```

---

## 📸 Screenshots

### Homepage
![Homepage funktioniert](C:/Users/mark/.gemini/antigravity/brain/225b58de-c6a9-4fca-8082-c41578eb18b1/home_top_1764507301096.png)

### Booking Page - Initial State
![Booking zeigt Step 3 statt Step 1](C:/Users/mark/.gemini/antigravity/brain/225b58de-c6a9-4fca-8082-c41578eb18b1/book_page_initial_retry_1764507426741.png)

**Problem sichtbar:** User ist in Step 3 (DateTime) gefangen, sollte aber in Step 1 (Service) starten.

---

## 🎯 Nächste Schritte

### **Option 1: Schnell lauffähig machen** (1-2 Std)
1. ESLint-Fehler fixen
2. SQL-Seed für staff_services
3. Booking Step 1 als Default setzen (Store-Bug?)
4. Bestätigungs-Flow testen

### **Option 2: Sauberer Neustart** (siehe Conversations-Historie)
In Conversation `b0da5475` wurde ein kompletter Neustart diskutiert:
- Lessons Learned dokumentieren
- Clean Architecture
- Best Practices von Anfang an

---

## 📦 Dependencies

**Key Packages:**
```json
{
  "next": "16.0.5",
  "react": "19.2.0",
  "@supabase/supabase-js": "^2.86.0",
  "zustand": "^5.0.8",
  "framer-motion": "^12.23.24",
  "tailwindcss": "^4",
  "@react-google-maps/api": "^2.20.7"
}
```

**Dev Dependencies:**
```json
{
  "typescript": "^5",
  "eslint": "^9",
  "eslint-config-next": "16.0.5"
}
```

---

## 🌐 Umgebung

- **Dev-Server:** http://localhost:3000 (läuft)
- **Database:** Supabase (Credentials in `.env.local`)
- **Auth:** Supabase Auth
- **Deployment:** TBD (Vercel empfohlen)

---

## 🚨 Kritische Dateien mit Fehlern

1. `src/components/booking/StepService.tsx` - **3 Fehler**
2. `src/components/booking/StepStaff.tsx` - **2 Fehler**
3. `src/components/booking/StepLocation.tsx` - **3 Fehler**
4. `src/components/Navbar.tsx` - **6 Fehler**
5. `src/app/admin/page.tsx` - **1 Fehler**

---

**Report Ende**  
*Generiert durch Antigravity AI - 30.11.2025, 13:53 Uhr*
