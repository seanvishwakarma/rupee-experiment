# Next agent work plan

## 0. Establish the baseline
Run `node --version`, `npm test`, and `npm start`. Review `server.js`, `public/`, `src/razorpay.js`, and tests. The demo is deliberately synthetic. Do not confuse mock tests or demo approval with a real gateway. Record results and ask for missing decisions when needed.

## 1. Provider and security design
- Confirm Razorpay approval, account capabilities and public identity display before going live; use provider documentation and account-specific evidence. Owner provides credentials privately through environment/secret manager, not chat.
- Decide durable database and transactional data model, hosting, admin and supporter identity/recovery. Propose exact payment/refund states, state transitions, event verification and reconciliation behavior.
- Treat network timeout after creation as ambiguous; lookup/reconcile rather than create a duplicate. Prevent duplicate webhook processing and double-refunds with database constraints and atomic operations.
- Define and obtain approval for privacy policy, genuine-error contact and fund use. Replace all demo branding and fictitious data appropriately.
- Do not wire the known demo password or demo approve/reject route to real payments. Develop production routes separately and remove/disable demo in production.

## 2. Implement secure MVP
- Introduce database migrations, persistence and tests, safe config validation, separate secrets and staging/live environments.
- Implement an approved provider link/checkout flow; QR only if documented and enabled. Validate integer paise and provider limits.
- Add authenticated raw-body webhook endpoint, event ID deduplication, provider payment status/amount/currency verification, database transaction boundaries, reconciliation job, and provider-confirmed refund/dispute handling.
- Implement supporter profile, recovery, consent, cumulative leaderboard and derived counters according to approved semantics. Filter and escape names; never publish private identifiers.
- Implement secure admin access and protection, audit logs, access policies, export and backup/restore. Add production error handling, monitoring and operational alerts.
- Replace simulation wording only after the real flow is correctly integrated; never collect real payments while the frontend says demo or the backend counts mock approvals.

## 3. Test and verify
- Unit tests for amount validation, webhook exact-body signature, bad signatures, authorization and privacy.
- Database/integration tests for capture matching, duplicate/parallel events, event ordering, API timeouts, retry/reconciliation, refund and reversal races, negative and partial balances and supporter recovery.
- Browser and mobile tests for accessibility, forms, supported payment apps, payment status updates and admin controls.
- Staging tests with Razorpay test keys, provider webhook retries and event logs. Live ₹1 testing only with owner approval and provider-compliant test plan. Inspect all public payment surfaces and receipts for identity leakage.
- Security review, backup restoration, deployment/rollback, alerting and explicit owner launch sign-off. Define commands and evidence based on selected stack; no test has yet validated production behavior.

## 4. EGM review
Install the full upstream plugin in a supported host; ensure review agents can be launched in genuinely fresh contexts. Run the EGM five-stage review on the actual design, retain reports, and resolve or accept findings with owner. If isolated subagents are unavailable, say so; a same-context self-check is not an EGM Goldfish review.

## Never do
- Tell the user that inserting secrets alone makes the current prototype ready.
- Collect secrets, PINs, OTPs, or KYC in chat or source control.
- Claim a provider feature, acceptable-use approval, public anonymity or successful live payment without evidence.
- Release the demo server as production or make personal UPI a fallback.
