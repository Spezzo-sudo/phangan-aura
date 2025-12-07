# Ganzheitlicher Review (Stand aktueller Codebasis)

## Systemüberblick
- **Checkout-Flow:** Der API-Handler validiert Warenkorbartikel gegen Supabase, erstellt eine Order mit Gebührenaufschlüsselung und leitet Karten-Zahlungen über Stripe weiter, während Barzahlungen sofort den Lagerbestand reduzieren und direkt zum Success-Screen führen. 【F:src/app/api/checkout/route.ts†L9-L175】
- **Stripe-Webhooks:** Erfolgreiche Sessions setzen Orders auf „paid/confirmed“ und reduzieren den Lagerbestand, fehlgeschlagene oder abgelaufene Sessions werden storniert. 【F:src/app/api/stripe/webhook/route.ts†L11-L129】
- **UX & Design:** Der Hero nutzt großflächige Blob-Animationen mit `prefers-reduced-motion`-Fallback und ein optimiertes Hero-Bild via `next/image`. 【F:src/components/Hero.tsx†L8-L115】
- **Navigation/Rollen:** Die Navbar leitet Nutzer abhängig von der im Profil hinterlegten Rolle zu Admin-/Staff-/Kunden-Ansichten, prüft Rollen aber nur clientseitig nach dem Supabase-Fetch. 【F:src/components/Navbar.tsx†L25-L174】

## Hauptherausforderungen
1. **Rollen- und Policy-Durchsetzung:** Rollen werden im Frontend abgeleitet, aber API-Routen wie Checkout/Webhook enthalten keine rollenbasierten Prüfungen. Ohne aktivierte RLS-Policies können Orders, Bestand oder Profile potentiell breiter als gewünscht verändert werden. 【F:src/components/Navbar.tsx†L59-L174】【F:src/app/api/checkout/route.ts†L9-L175】【F:src/app/api/stripe/webhook/route.ts†L11-L129】
2. **Zahlungs-Idempotenz & Lager-Reserven:** Der Webhook schreibt Bestand und Status ohne Event-Idempotenz oder Reservierungs-Logik; bei wiederholten Events oder parallelen Bestellungen kann Lager doppelt reduziert bzw. überverkauft werden. 【F:src/app/api/stripe/webhook/route.ts†L11-L129】【F:src/app/api/checkout/route.ts†L113-L175】
3. **Performance/Motion:** Zwei dauerhaft laufende Blob-Animationen im Hero bleiben auch mit reduziertem Motion-Fallback relativ intensiv und können auf schwächeren Geräten LCP/CPU belasten. 【F:src/components/Hero.tsx†L12-L115】
4. **Checkout-Fehler-Resilienz:** Cash-Orders leeren den Bestand sofort, Karten-Orders verlassen sich auf erfolgreiche Webhook-Rückläufe; ein expliziter Status-Funnel (pending/paid/failed) im UI und Rate-Limiting für die Checkout-API fehlen. 【F:src/app/api/checkout/route.ts†L67-L175】
5. **Auditierbarkeit & Nachvollziehbarkeit:** Weder Checkout- noch Webhook-Handler protokollieren Änderungen in Audit-Tabellen (z. B. Event-Logs, Order-History), was Forensik und DSGVO-Nachweise erschwert. 【F:src/app/api/checkout/route.ts†L67-L175】【F:src/app/api/stripe/webhook/route.ts†L11-L129】

## Empfohlene nächste Schritte
- **RLS & Service-Rollen aktivieren:** Die dokumentierten Policies in Supabase produktiv setzen und serverseitige Routen mit Service-Role-Keys ausführen, damit Admin-/Staff-/Kundenrechte zuverlässig greifen.
- **Webhook-Idempotenz & Reservierungen:** Webhook-Events per `event.id`/`payment_intent` in einer dedizierten Tabelle registrieren, verarbeitete Events short-circuiten und Stock-Reduktionen transaktional kapseln (z. B. via Supabase RPC). Optional: temporäre Lager-Reservierungen mit TTL bei Session-Erstellung.
- **UI-Status & Limits:** Checkout-UI um klare Statusanzeigen (pending/paid/failed) und Retry-Hinweise ergänzen sowie Rate-Limits/Abuse-Schutz auf den Checkout- und Validate-Endpunkten einführen.
- **Motion drosseln:** Einen globalen Reduced-Motion-Schalter bereitstellen, der die Blob-Animationen komplett deaktiviert bzw. durch statische Gradients ersetzt, und Animationsdauer auf Mobile reduzieren.
- **Audit & Protokollierung:** Änderungen an Orders/Bestand in einer Audit-Tabelle erfassen (User, Zeitpunkt, Event-ID), um Compliance- und Support-Fälle nachvollziehbar zu machen.
