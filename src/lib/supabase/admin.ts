import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

let cachedClient: SupabaseClient<Database> | null = null

export function createAdminClient() {
    if (cachedClient) return cachedClient

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
        throw new Error('Supabase service role credentials are not configured')
    }

    cachedClient = createClient<Database>(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    })

    return cachedClient
}
