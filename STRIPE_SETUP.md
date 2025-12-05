# 🚀 Stripe Checkout - Setup Guide

## ✅ Was wurde implementiert:

### 1. **Database**
- `orders` Tabelle erstellt (`CREATE_ORDERS.md`)
- RLS Policies (Users sehen eigene Orders, Admins sehen alle)
- Order Number Generator

### 2. **API Endpoint**
- `src/app/api/checkout/route.ts`
- Erstellt Order in Supabase
- Erstellt Stripe Checkout Session
- Währung: **THB** (Thai Baht)

### 3. **Pages**
- `src/app/checkout/page.tsx` - Checkout Form
- `src/app/checkout/success/page.tsx` - Success Page
- `src/app/checkout/cancel/page.tsx` - Cancel Page

---

## 🔧 SETUP SCHRITTE:

### **Schritt 1: Supabase SQL ausführen**
1. Öffne Supabase Dashboard → SQL Editor
2. Kopiere den Inhalt von `CREATE_ORDERS.md`
3. Führe das SQL aus

### **Schritt 2: Stripe Account erstellen**
1. Gehe zu https://stripe.com/ch
2. Registriere dich mit Schweizer Adresse
3. Bank: Dein Schweizer Bankkonto (UBS, ZKB, PostFinance, Neon, etc.)

### **Schritt 3: Stripe API Keys holen**
1. In Stripe Dashboard → Developers → API keys
2. Kopiere:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

### **Schritt 4: Environment Variables**
Erstelle/bearbeite `.env.local`:
```env
# Bestehende Supabase Vars bleiben
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# NEU: Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# NEU: Site URL für Stripe Redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Schritt 5: Stripe Package installieren**
```bash
npm install stripe @stripe/stripe-js
```

### **Schritt 6: CartDrawer anpassen**
In `src/components/shop/CartDrawer.tsx` Zeile ~252 ändern:

**Alt:**
```tsx
<button
    onClick={() => setStep('checkout')}
    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-aura-teal transition-colors flex items-center justify-center gap-2"
>
    Proceed to Checkout <ArrowRight size={18} />
</button>
```

**Neu:**
```tsx
<button
    onClick={() => { toggleCart(); router.push('/checkout'); }}
    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-aura-teal transition-colors flex items-center justify-center gap-2"
>
    Proceed to Checkout <ArrowRight size={18} />
</button>
```

### **Schritt 7: CartStore erweitern**
In `src/lib/cartStore.ts` muss `price_thb` im CartItem sein:

```tsx
export interface CartItem {
    id: string;
    name: string;
    price: number;        // Bestehend
    price_thb: number;    // NEU hinzufügen
    quantity: number;
    image?: string;
}
```

### **Schritt 8: Server neu starten**
```bash
npm run dev
```

---

## 🧪 TESTEN:

### **Test-Kreditkarten von Stripe:**
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **CVV:** irgendeine 3-stellige Zahl
- **Datum:** irgendein  zukünftiges Datum
- **Postleitzahl:** irgendeine

### **Test-Ablauf:**
1. Gehe zu `/shop`
2. Füge Produkte zum Warenkorb hinzu
3. Klicke "Proceed to Checkout"
4. Fülle das Formular aus
5. Klicke "Pay ... ฿"
6. Wirst zu Stripe Checkout weiter geleitet
7. Bezahle mit Test-Karte `4242 4242 4242 4242`
8. Wirst zu Success Page weitergeleitet

---

## 📊 Was passiert:

1. **User klickt "Proceed to Checkout"**
   → Weiterleitung zu `/checkout`

2. **User füllt Formular aus**
   → Name, Email, Telefon, Adresse

3. **User klickt "Pay"**
   → API Call zu `/api/checkout`
   → Order wird in Supabase erstellt (Status: pending)
   → Stripe Session wird erstellt
   → User wird zu Stripe Checkout umgeleitet

4. **User zahlt bei Stripe**
   → Stripe processed Payment
   → User wird zu `/checkout/success` umgeleitet
   → (Later: Webhook updated Order zu "paid")

5. **Admin sieht Order**
   → Im Admin Dashboard (Orders Tab - noch zu bauen)

---

## ⚠️ Was fehlt noch:

### **WICHTIG:**
1. ✅ Stripe Webhooks (für Auto-Order-Status-Update)
2. ✅ Admin Order Management Page
3. ✅ Customer Order History Page
4. ✅ Email Notifications

### **OPTIONAL:**
5. Invoice System
6. Refund Handling
7. Shipping Tracking

---

## 💰 Kosten:

**TEST MODE** (jetzt):
- ✅ Kostenlos
- ✅ Keine echten Zahlungen
- ✅ Nur Test-Karten funktionieren

**LIVE MODE** (später):
- Stripe Gebühren: **2.9% + 0.30 USD** pro Transaktion
- Währungsumrechnung: **~2%** (THB → CHF)
- **Gesamt: ~5% pro Transaktion**

Bei 1.000 THB Umsatz:
- Stripe Fee: ~40 THB
- FX Fee: ~20 THB
- **Du bekommst: ~940 THB** (= ~23 CHF auf Schweizer Konto)

---

## 🎯 NÄCHSTE SCHRITTE:

Nach erfolgreichem Test:
1. ✅ Webhooks implementieren
2. ✅ Admin Order Dashboard
3. ✅ Customer Order History
4. ✅ Email Notifications
5. Live schalten mit echtem Stripe Account

**Soll ich weitermachen mit dem Webhook + Order Management?** 🚀
