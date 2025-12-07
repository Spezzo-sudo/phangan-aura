# Providing Supabase data for review

To give a holistic picture of your Supabase setup without leaking secrets, share the following artifacts:

- **Project context:** Project URL, enabled auth providers, and whether RLS is enabled on `orders`, `products`, `profiles`, and `bookings`.
- **Schema & policies:** A sanitized SQL dump of tables, views, and RLS policies (no user data).
- **Sample data (optional):** Synthetic rows that mimic real shapes for `products`, `orders`, `order_items`, and `profiles`.
- **Environment skeleton:** A `.env.example` showing required keys (URL, anon key, service key placeholder) without real secrets.

## Steps to produce the bundle
1. Install the Supabase CLI (`npm i -g supabase` or `brew install supabase/tap/supabase`).
2. Authenticate (`supabase login`) with a token that has project-read scope.
3. Export schema and policies without data:
   ```bash
   supabase db dump \
     --schema public \
     --data-only=false \
     --file supabase-schema.sql
   ```
4. Create synthetic seed data (no PII) for key tables:
   ```bash
   supabase db dump \
     --data-only \
     --include-tables products,orders,order_items,profiles \
     --file supabase-sample-data.sql
   ```
   Review the file to ensure it contains only anonymized or fake values.
5. Add a redacted `.env.example` with placeholders:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-or-placeholder>
   SUPABASE_SERVICE_ROLE_KEY=<service-key-placeholder>
   STRIPE_SECRET_KEY=<placeholder>
   STRIPE_WEBHOOK_SECRET=<placeholder>
   ```
6. Zip the artifacts (`supabase-schema.sql`, `supabase-sample-data.sql`, `.env.example`) and share the archive. Never share live service or webhook secrets publicly.

## Optional: end-to-end reproducibility
- Provide a short note on how roles map to policies (e.g., admins can update stock/prices, staff can update assigned orders, customers can only read their orders).
- If you use edge functions or RPC procedures for stock updates or webhooks, include their SQL/TypeScript sources to ensure reviewers can evaluate transactional guarantees and idempotency.

These steps let reviewers validate schema design, RLS coverage, and data flows without exposing sensitive production data.

## Provided sample bundle (in this repo)
- `docs/supabase-sample-data.sql` contains anonymized product/profile rows plus a hardened RLS policy script for profiles, bookings,
  orders, services/products, and availability. You can load it locally with:
  ```bash
  supabase db reset --linked \
    --db-url "$SUPABASE_DB_URL" \
    --file docs/supabase-sample-data.sql
  ```
  Replace `SUPABASE_DB_URL` with a local connection string (e.g., from `supabase start`) to avoid touching production.
