# 🛍️ PROFESSIONELLER E-COMMERCE SHOP - MASTER PLAN
**Datum**: 03.12.2025 03:16 Uhr  
**Basierend auf**: Internet-Recherche + Best Practices

---

## 📋 EXECUTIVE SUMMARY

**Ziel**: Aufbau eines professionellen Shop-Systems mit vollständigem Inventory Management, automatischen Bestandswarnungen, Rechnungserstellung und Buchhaltungs-Integration.

**Basis-Recherche abgeschlossen**:
- ✅ E-Commerce Inventory Best Practices
- ✅ Invoice/Billing System Requirements  
- ✅ Stock Alert Strategies
- ✅ Accounting Integration Standards

---

## 🎯 FEATURE-LISTE: VOLLSTÄNDIGER SHOP

### **PHASE 1: INVENTORY MANAGEMENT** 📦

#### 1.1 **Produkt-Stammdaten**
**Neue Felder für `products` Tabelle:**

```sql
-- Inventory Tracking
stock_quantity INTEGER DEFAULT 0,
stock_reserved INTEGER DEFAULT 0, -- Von offenen Orders reserviert
stock_available INTEGER GENERATED ALWAYS AS (stock_quantity - stock_reserved) STORED,

-- Reorder Management
reorder_point INTEGER DEFAULT 10, -- Wann nachbestellt werden soll
reorder_quantity INTEGER DEFAULT 50, -- Wieviel nachbestellt wird
supplier_id UUID REFERENCES suppliers(id),
supplier_sku TEXT,
lead_time_days INTEGER DEFAULT 7,

-- Cost Tracking
cost_price_thb DECIMAL(10,2), -- Einkaufspreis
profit_margin DECIMAL(5,2), -- % Gewinnmarge

-- Status
is_low_stock BOOLEAN GENERATED ALWAYS AS (stock_available <= reorder_point) STORED,
is_out_of_stock BOOLEAN GENERATED ALWAYS AS (stock_available <= 0) STORED,
stock_status TEXT, -- 'in_stock', 'low_stock', 'out_of_stock', 'discontinued'

-- History
last_restocked_at TIMESTAMP,
last_sold_at TIMESTAMP
```

#### 1.2 **Stock Movements Tracking**
**Neue Tabelle: `inventory_movements`**

```sql
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    movement_type TEXT NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return', 'damage'
    quantity INTEGER NOT NULL, -- Positiv für Zukäufe, Negativ für Verkäufe
    reference_type TEXT, -- 'order', 'manual', 'supplier_order'
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Verwendung**:
- Jeder Verkauf → Movement Type 'sale'
- Jede Nachbestellung → Movement Type 'purchase'
- Manuelle Korrektur → Movement Type 'adjustment'
- Defekte Ware → Movement Type 'damage'

#### 1.3 **Low Stock Alerts System**
**Neue Tabelle: `stock_alerts`**

```sql
CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    alert_type TEXT NOT NULL, -- 'low_stock', 'out_of_stock', 'reorder_suggested'
    stock_level INTEGER,
    threshold INTEGER,
    status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    acknowledged_by UUID REFERENCES profiles(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Automatische Alert-Generierung**:
```typescript
// Supabase Function oder API Route
async function checkStockLevels() {
    const products = await getProductsWithLowStock();
    
    for (const product of products) {
        if (product.stock_available <= 0) {
            createAlert(product, 'out_of_stock');
        } else if (product.stock_available <= product.reorder_point) {
            createAlert(product, 'low_stock');
            // Auto-generate purchase order?
            if (AUTO_REORDER_ENABLED) {
                createPurchaseOrder(product);
            }
        }
    }
}
```

**Alert-Benachrichtigungen**:
- 📧 Email an Admin
- 🔔 In-App Notification Badge
- 📱 Optional: SMS/WhatsApp
- 📊 Dashboard Widget

#### 1.4 **Purchase Orders (Nachbestellung)**
**Neue Tabelle: `purchase_orders`**

```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT UNIQUE NOT NULL, -- PO-2025-001
    supplier_id UUID REFERENCES suppliers(id),
    status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'confirmed', 'received', 'cancelled'
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2),
    shipping_cost DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    received_quantity INTEGER DEFAULT 0
);
```

#### 1.5 **Suppliers Management**
**Neue Tabelle: `suppliers`**

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    lead_time_days INTEGER DEFAULT 7,
    min_order_amount DECIMAL(10,2),
    payment_terms TEXT, -- 'net_30', 'cod', etc.
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **PHASE 2: ORDER MANAGEMENT** 📋

#### 2.1 **Order Status Workflow**
**Erweiterte Order Status:**

```typescript
type OrderStatus = 
    | 'pending'        // Wartet auf Zahlung
    | 'paid'           // Bezahlt
    | 'processing'     // Wird bearbeitet
    | 'ready_to_ship'  // Bereit zum Versand
    | 'shipped'        // Versandt
    | 'out_for_delivery' // Auf dem Weg zum Kunden
    | 'delivered'      // Zugestellt
    | 'completed'      // Abgeschlossen
    | 'cancelled'      // Storniert
    | 'refunded';      // Rückerstattet
```

**Status-Updates auslösen**:
- ✅ Stock-Reservierung bei 'pending'
- ✅ Stock-Abzug bei 'paid'
- ✅ Rechnung-Erstellung bei 'paid'
- ✅ Pickup/Delivery Notification bei 'ready_to_ship'
- ✅ Tracking bei 'shipped'
- ✅ Stock-Freigabe bei 'cancelled'

#### 2.2 **Delivery/Fulfillment**
**Für dein Business-Modell (Bookings + Shop)**:

**Option A: Delivery mit Bookings** ✅ EMPFOHLEN
```
- Produkte werden ZUSAMMEN mit Booking geliefert
- Staff bringt Produkte zur Massage/Service mit
- Automatische Zuordnung: "Booking in nächsten 48h?"
```

**Option B: Separate Delivery**
```
- Eigener Lieferservice
- Pickup-Option im Shop
- Tracking-System
```

**Implementation**:
```typescript
// Bei Shop-Checkout
if (hasUpcomingBooking(customerId, within48Hours)) {
    // Attach to booking
    deliveryMethod = 'with_booking';
    shipping_cost = 0;
} else {
    // Separate delivery OR pickup
    deliveryMethod = userChoice; // 'pickup' or 'delivery'
    shipping_cost = deliveryMethod === 'delivery' ? 50 : 0;
}
```

---

### **PHASE 3: INVOICING & BILLING** 🧾

#### 3.1 **Invoice Generation**
**Neue Tabelle: `invoices`**

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL, -- INV-2025-001
    order_id UUID REFERENCES orders(id),
    booking_id UUID REFERENCES bookings(id), -- Falls zusammen
    customer_id UUID REFERENCES profiles(id),
    
    -- Invoice Details
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Amounts
    subtotal DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 7.00, -- Thailand VAT
    tax_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    
    -- Payment
    payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid', 'overdue'
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT,
    paid_at TIMESTAMP,
    
    -- PDF
    pdf_url TEXT, -- S3/Supabase Storage
    
    -- Notes
    notes TEXT,
    terms TEXT, -- Payment terms
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    description TEXT NOT NULL,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
);
```

#### 3.2 **Tax Berechnung (Thailand)**
```typescript
const TAX_RATE = 0.07; // 7% VAT Thailand

function calculateInvoice(items: Item[]) {
    const subtotal = items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
    );
    
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
}
```

#### 3.3 **PDF Invoice Generation**
**Libraries**:
- **jsPDF** oder **PDFKit** für PDF-Erstellung
- **@react-pdf/renderer** für React-based PDFs

**Template**:
```
┌─────────────────────────────────────┐
│      PHANGAN AURA WELLNESS         │
│      Invoice #INV-2025-001         │
├─────────────────────────────────────┤
│ Date: 03.12.2025                   │
│ Customer: Max Mustermann           │
│                                     │
│ ITEMS:                              │
│ - Aromatherapy Oil x2    ฿400      │
│ - Massage Candles x1     ฿200      │
│                                     │
│ Subtotal:                ฿600      │
│ VAT (7%):                ฿42       │
│ ─────────────────────────────────  │
│ TOTAL:                   ฿642      │
│                                     │
│ Payment: Credit Card (Paid)        │
└─────────────────────────────────────┘
```

---

### **PHASE 4: ACCOUNTING INTEGRATION** 💰

#### 4.1 **Chart of Accounts**
**Neue Tabelle: `chart_of_accounts`**

```sql
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code TEXT UNIQUE NOT NULL, -- '4000', '5000', etc.
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true
);
```

**Standard-Konten für dein Business**:
```
4000 - Revenue - Booking Services
4100 - Revenue - Shop Sales
4110 - Revenue - Products
4120 - Revenue - Addons

5000 - Cost of Goods Sold (COGS)
5100 - Product Costs
5200 - Material Costs

6000 - Operating Expenses
6100 - Staff Commissions
6200 - Transport Fees
6300 - Stripe/Payment Fees
```

#### 4.2 **General Ledger Entries**
**Neue Tabelle: `general_ledger`**

```sql
CREATE TABLE general_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_date DATE NOT NULL,
    account_id UUID REFERENCES chart_of_accounts(id),
    transaction_type TEXT NOT NULL, -- 'debit', 'credit'
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_type TEXT, -- 'booking', 'order', 'invoice', 'payment'
    reference_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Auto-Booking bei Shop-Order**:
```typescript
async function recordShopSale(order: Order) {
    // Debit: Cash/Stripe Account
    await createLedgerEntry({
        account: ACCOUNTS.CASH,
        type: 'debit',
        amount: order.total_amount,
        reference: order.id
    });
    
    // Credit: Shop Revenue
    await createLedgerEntry({
        account: ACCOUNTS.SHOP_REVENUE,
        type: 'credit',
        amount: order.subtotal,
        reference: order.id
    });
    
    // Credit: VAT Payable
    await createLedgerEntry({
        account: ACCOUNTS.VAT_PAYABLE,
        type: 'credit',
        amount: order.tax_amount,
        reference: order.id
    });
    
    // Debit: COGS
    await createLedgerEntry({
        account: ACCOUNTS.COGS,
        type: 'debit',
        amount: order.cost_price,
        reference: order.id
    });
    
    // Credit: Inventory
    await createLedgerEntry({
        account: ACCOUNTS.INVENTORY,
        type: 'credit',
        amount: order.cost_price,
        reference: order.id
    });
}
```

---

### **PHASE 5: ADMIN DASHBOARDS** 📊

#### 5.1 **Inventory Dashboard**
**Features**:
- 📦 Stock Levels Overview
- ⚠️ Low Stock Alerts (Badge)
- 📉 Slow-Moving Items
- 📈 Fast-Moving Items
- 💰 Inventory Value Total
- 📊 Stock Turnover Rate
- 🔄 Reorder Suggestions

**Widgets**:
```typescript
<InventoryDashboard>
    <StockAlertsWidget />
    <TopSellingProductsWidget />
    <LowStockProductsWidget />
    <InventoryValueWidget />
    <StockMovementsChart />
    <ReorderSuggestionsWidget />
</InventoryDashboard>
```

#### 5.2 **Orders Dashboard**
**Features**:
- 📋 Order List mit Filtern (Status, Date)
- 🔍 Order Details View
- ✅ Status Update (Bulk Actions)
- 📄 Invoice Generation
- 📧 Customer Notifications
- 📦 Packing Slips
- 🚚 Shipping Label Integration?

#### 5.3 **Financial Dashboard** (erweitert)
**Zusätzlich zu bestehend**:
- 💰 Profit & Loss Report
- 📊 Sales by Product Category
- 💵 Cash Flow Forecast
- 📈 Revenue vs. COGS
- 🎯 Profit Margin Analysis
- 📉 Expense Breakdown

---

### **PHASE 6: NOTIFICATIONS & ALERTS** 🔔

#### 6.1 **Alert Types**

**Inventory Alerts**:
- ⚠️ Low Stock (Product X ist bei 5 Stück)
- 🚨 Out of Stock (Product Y ausverkauft!)
- 📦 Reorder Suggested (Jetzt nachbestellen: 50 Stück)
- ✅ Stock Received (Lieferung angekommen: 100 Stück)

**Order Alerts**:
- 🛒 New Order (#123)
- 💳 Payment Received
- 📦 Ready for Pickup/Delivery
- ✅ Order Completed

**Financial Alerts**:
- 💰 Low Cash Flow Warning
- 📄 Invoice Overdue
- 💵 Payment Received

#### 6.2 **Notification Channels**
```typescript
interface NotificationSettings {
    email: boolean;
    inApp: boolean;
    sms?: boolean;
    whatsapp?: boolean;
}

// Per Alert-Type konfigurierbar
const ALERT_SETTINGS = {
    low_stock: { email: true, inApp: true },
    out_of_stock: { email: true, inApp: true, sms: true },
    new_order: { email: false, inApp: true },
    payment_received: { email: true, inApp: true },
};
```

---

### **PHASE 7: REPORTING** 📈

#### 7.1 **Standard Reports**

**Inventory Reports**:
- Current Stock Levels
- Stock Movement History
- Inventory Valuation
- Dead Stock Report
- Stock Turnover Analysis

**Sales Reports**:
- Sales by Product
- Sales by Category  
- Sales by Period (Daily/Weekly/Monthly)
- Customer Purchase History
- Best Sellers Report

**Financial Reports**:
- Profit & Loss Statement
- Balance Sheet
- Cash Flow Statement
- Tax Report (VAT)
- Commission Breakdown

**Purchase Reports**:
- Purchase Orders List
- Supplier Performance
- Purchase History
- Cost Analysis

#### 7.2 **Export Formats**
- 📄 PDF
- 📊 Excel/CSV
- 📧 Email scheduled reports

---

## 🏗️ IMPLEMENTATION PLAN

### **SPRINT 1: Foundation** (1 Woche)
- [ ] Database Schema erweitern
- [ ] Supplier Management
- [ ] Stock Movements Tracking
- [ ] Basic Inventory Dashboard

### **SPRINT 2: Alerts** (1 Woche)
- [ ] Low Stock Alert System
- [ ] Email Notifications
- [ ] In-App Notification Badge
- [ ] Alert Dashboard Widget

### **SPRINT 3: Orders** (1 Woche)
- [ ] Order Status Workflow
- [ ] Order Management Dashboard
- [ ] Delivery/Fulfillment Logic
- [ ] Stock Reservation

### **SPRINT 4: Invoicing** (1 Woche)
- [ ] Invoice Data Model
- [ ] Invoice Generation Logic
- [ ] PDF Template
- [ ] Tax Calculation

### **SPRINT 5: Accounting** (1 Woche)
- [ ] Chart of Accounts
- [ ] General Ledger
- [ ] Auto-Booking Logic
- [ ] Financial Reports

### **SPRINT 6: Polish** (1 Woche)
- [ ] Purchase Orders
- [ ] Advanced Reports
- [ ] Performance Optimization
- [ ] Testing & Bug Fixes

**Total: 6 Wochen Development**

---

## 💡 BEST PRACTICES (aus Recherche)

### **Inventory Management**
1. ✅ **Reorder Point Formula**: (Avg Daily Sales × Lead Time) + Safety Stock
2. ✅ **ABC Analysis**: Kategorisiere Produkte nach Wert/Umsatz
3. ✅ **Real-time Tracking**: Automatische Updates bei jeder Transaktion
4. ✅ **Regular Audits**: Monatliche physische Bestandsaufnahme
5. ✅ **Demand Forecasting**: Historische Daten für Vorhersagen nutzen

### **Alert System**
1. ✅ **Prioritization**: Kritische Alerts zuerst
2. ✅ **Avoid Fatigue**: Nicht zu viele Alerts
3. ✅ **Actionable**: Jeder Alert mit klarer Aktion
4. ✅ **Customizable**: Thresholds pro Produkt
5. ✅ **Multi-Channel**: Email + In-App

### **Invoicing**
1. ✅ **Sequential Numbers**: INV-YYYY-NNN Format
2. ✅ **Clear Terms**: Payment terms deutlich  
3. ✅ **Tax Compliance**: Thailand VAT 7%
4. ✅ **Professional Design**: Branded Templates
5. ✅ **Automated**: Auto-generate bei Payment

### **Accounting Integration**
1. ✅ **Double-Entry**: Immer Debit + Credit
2. ✅ **Real-time**: Sofort buchen, nicht batched
3. ✅ **Reconciliation**: Regelmäßig abgleichen
4. ✅ **Audit Trail**: Alle Änderungen loggen
5. ✅ **Reports**: Standardisierte Berichte

---

## 🎯 QUICK WINS (Sofort umsetzbar)

### **LEVEL 1: Basic** (2-3 Tage)
1. ✅ `stock_quantity` Feld zu products hinzufügen
2. ✅ Stock abziehen bei Order
3. ✅ "Out of Stock" Badge im Shop
4. ✅ Admin kann Stock manuell ändern

### **LEVEL 2: Intermediate** (1 Woche)
1. ✅ `reorder_point` und `stock_alerts` Table
2. ✅ Low Stock Email Notification
3. ✅ Stock Movements History
4. ✅ Inventory Dashboard Widget

### **LEVEL 3: Advanced** (2+ Wochen)
1. ✅ Purchase Orders System
2. ✅ Invoice Generation
3. ✅ Accounting Integration
4. ✅ Advanced Reports

---

## 📊 TECHNICAL STACK EMPFEHLUNG

**Database**: Supabase PostgreSQL ✅ (bereits)

**PDF Generation**: 
- `@react-pdf/renderer` - React-friendly
- `jsPDF` - Browser-basiert  
- `puppeteer` - Server-side (mehr Kontrolle)

**Notification**:
- Email: Resend API
- In-App: Zustand Store + Supabase Realtime
- SMS: Twilio (optional)

**Reporting**:
- Charts: `recharts` oder `chart.js`
- Excel Export: `xlsx` library
- PDF: `jsPDF` oder `pdfmake`

**File Storage**:
- Invoices/PDFs: Supabase Storage
- Backup: S3 (optional)

---

## 💰 COST ESTIMATES

**Development**:
- 6 Wochen × 40h = 240 Stunden
- @ €50/h = **€12,000**
- @ €75/h = **€18,000**

**Monthly Running Costs**:
- Supabase: €25-50
- Email (Resend): €10-20
- Storage: €5-10
- **Total: €40-80/month**

---

## ✅ NEXT STEPS

**JETZT SOFORT** (wenn du willst):
1. Database Schema für Level 1 erstellen
2. Stock Quantity zu Products hinzufügen
3. Basic Stock Management implementieren

**DIESE WOCHE**:
1. Low Stock Alerts
2. Inventory Dashboard
3. Order Management verbessern

**NÄCHSTE WOCHE**:
1. Invoice System
2. Purchase Orders
3. Reports

---

**BEREIT ZUM STARTEN?** 🚀

Sag mir welches Level du zuerst willst und ich implementiere es!
