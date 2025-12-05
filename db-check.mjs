import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brdnsnohjamrasayirmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZG5zbm9oamFtcmFzYXlpcm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjQwNDQsImV4cCI6MjA4MDAwMDA0NH0.GItf0ixr0WjiRy5ZfIY1VxSjmlGydHRob6twwf5xw10';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDatabase() {
    console.log('🔍 DATABASE ANALYSE STARTET...\n');

    // 1. Check BOOKINGS table structure
    console.log('📋 BOOKINGS TABLE:');
    console.log('==================');
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);

    if (bookingsError) {
        console.error('❌ Error:', bookingsError.message);
    } else if (bookings && bookings.length > 0) {
        const columns = Object.keys(bookings[0]);
        console.log('✅ Spalten:', columns.join(', '));

        // Check for critical columns
        const requiredColumns = [
            'total_price',
            'addons',
            'payment_method',
            'staff_commission',
            'transport_fee',
            'stripe_fee',
            'material_cost',
            'company_share',
            'paid_to_staff',
            'customer_name',
            'customer_phone'
        ];

        console.log('\n🔎 KRITISCHE SPALTEN CHECK:');
        const missingColumns = [];
        requiredColumns.forEach(col => {
            const exists = columns.includes(col);
            console.log(`${exists ? '✅' : '❌'} ${col}`);
            if (!exists) missingColumns.push(col);
        });

        if (missingColumns.length > 0) {
            console.log('\n🚨 FEHLENDE SPALTEN:', missingColumns.join(', '));
        } else {
            console.log('\n✅ Alle Spalten vorhanden!');
        }
    } else {
        console.log('⚠️ Keine Bookings vorhanden - kann Struktur nicht prüfen');
        console.log('Versuche leere INSERT...');
    }

    // 2. Check PROFILES table
    console.log('\n\n👤 PROFILES TABLE:');
    console.log('==================');
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profilesError) {
        console.error('❌ Error:', profilesError.message);
    } else if (profiles && profiles.length > 0) {
        console.log('✅ Spalten:', Object.keys(profiles[0]).join(', '));
    }

    // 3. Check SERVICES table
    console.log('\n\n🌸 SERVICES TABLE:');
    console.log('==================');
    const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .limit(1);

    if (servicesError) {
        console.error('❌ Error:', servicesError.message);
    } else if (services && services.length > 0) {
        console.log('✅ Spalten:', Object.keys(services[0]).join(', '));
        console.log(`📊 Anzahl Services: ${services.length}`);
    }

    // 4. Check PRODUCTS table
    console.log('\n\n🛍️ PRODUCTS TABLE:');
    console.log('==================');
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (productsError) {
        console.error('❌ Error:', productsError.message);
    } else if (products && products.length > 0) {
        console.log('✅ Spalten:', Object.keys(products[0]).join(', '));
    }

    // 5. Check ORDERS table
    console.log('\n\n📦 ORDERS TABLE:');
    console.log('==================');
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (ordersError) {
        console.error('❌ Error:', ordersError.message);
    } else if (orders) {
        if (orders.length > 0) {
            console.log('✅ Spalten:', Object.keys(orders[0]).join(', '));
        } else {
            console.log('✅ Tabelle existiert (aber leer)');
        }
    }

    // 6. Check COMPANY_SETTINGS table
    console.log('\n\n💼 COMPANY_SETTINGS TABLE:');
    console.log('==========================');
    const { data: settings, error: settingsError } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1);

    if (settingsError) {
        console.error('❌ Tabelle existiert NICHT:', settingsError.message);
    } else if (settings) {
        if (settings.length > 0) {
            console.log('✅ Spalten:', Object.keys(settings[0]).join(', '));
        } else {
            console.log('✅ Tabelle existiert (aber leer)');
        }
    }

    // 7. Count data
    console.log('\n\n📊 DATEN ÜBERSICHT:');
    console.log('==================');

    const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
    console.log(`📅 Bookings: ${bookingsCount || 0}`);

    const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
    console.log(`👤 Profiles: ${profilesCount || 0}`);

    const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });
    console.log(`🌸 Services: ${servicesCount || 0}`);

    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
    console.log(`🛍️ Products: ${productsCount || 0}`);

    console.log('\n✅ ANALYSE ABGESCHLOSSEN\n');
}

analyzeDatabase().catch(console.error);
