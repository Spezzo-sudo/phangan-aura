const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brdnsnohjamrasayirmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZG5zbm9oamFtcmFzYXlpcm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjQwNDQsImV4cCI6MjA4MDAwMDA0NH0.GItf0ixr0WjiRy5ZfIY1VxSjmlGydHRob6twwf5xw10';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing Supabase connection...");
    try {
        const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("❌ Connection failed!");
            console.error("Error details:", JSON.stringify(error, null, 2));
        } else {
            console.log("✅ Connection successful!");
            console.log("Supabase is reachable and credentials are correct.");
        }
    } catch (err) {
        console.error("❌ Unexpected error:", err.message);
    }
}

testConnection();
