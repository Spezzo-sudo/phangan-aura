-- Prevent duplicate processing of the same payment_intent across multiple events
create unique index if not exists webhook_events_payment_intent_unique
    on webhook_events (payment_intent_id)
    where payment_intent_id is not null;
