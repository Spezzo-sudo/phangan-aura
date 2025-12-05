const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brdnsnohjamrasayirmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZG5zbm9oamFtcmFzYXlpcm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjQwNDQsImV4cCI6MjA4MDAwMDA0NH0.GItf0ixr0WjiRy5ZfIY1VxSjmlGydHRob6twwf5xw10';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFetch() {
    console.log("Attempting to fetch products with ANON key...");
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error("❌ Error fetching products:");
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log(`✅ Success! Found ${data.length} products.`);
    }
}

debugFetch();
