-- Create table to track processed Stripe webhook events for idempotency
create table if not exists webhook_events (
    id uuid primary key default gen_random_uuid(),
    stripe_event_id text not null,
    payment_intent_id text,
    order_id uuid,
    event_type text not null,
    processed_at timestamptz not null default now(),
    status text default 'processed'
);

-- Ensure we never process the same event twice
create unique index if not exists webhook_events_stripe_event_id_idx
    on webhook_events (stripe_event_id);

create index if not exists webhook_events_payment_intent_idx
    on webhook_events (payment_intent_id);

-- RLS is not enabled because this table is only written from service-role contexts
-- (Stripe webhooks). If RLS is later enabled globally, add a policy that allows
-- only the service role to access this table.
