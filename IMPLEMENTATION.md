# Demo implementation

This is a synthetic-data-only prototype. There is **no Razorpay integration, no QR, no real UPI payment, no public launch, and no real verification**. The owner explicitly requested coding after the design was prepared; production remains blocked on provider approval, privacy tests, independent design review, and a production security design.

Run with Node.js 20+: `npm start`. Visit `/` and `/admin`. The default demo admin password is `demo-only`; use `DEMO_ADMIN_PASSWORD=... npm start` to change it. This demo password and the in-memory session mechanism are not suitable for production. Demo records persist in `data/demo.json`; delete that file to reset. Do not enter real personal data. `npm test` runs the included automated tests.

Demo limitations: each simulated contribution is a separate profile, so repeat supporter aggregation and real unique-human counting are not implemented. Leaderboard is all-time only; refunds are full only. A demo approval is not proof of payment. The dashboard offers only verify, reject and mark refunded. There are no real payment links, provider webhooks, live QR codes, KYC, bank integrations, supporter recovery, audit trail, CSRF-token protection, rate limits, backups, or production authentication. Provider/bank limits and privacy guarantees remain unverified.

## Razorpay foundation (not wired into the demo)
`src/razorpay.js` provides a payment-link client and raw-body webhook-signature validation. Tests mock provider responses; no real API request, webhook, privacy check, or provider account has been tested. Supplying secrets does not enable payments. No webhook endpoint, persistent transaction ledger, event processing, provider reconciliation, refund handling or production deployment exists. These must be completed and reviewed before accepting money.
