# Product requirements — current handoff

**Status:** Working requirements; the production architecture and launch are not approved.  
**Authority:** Current owner decisions supersede `PLAN.md` and any older Google Doc.  
**Date:** 2026-11-13.

## 1. Product and objective
An English-first, India-focused personal social experiment asks whether people voluntarily contribute ₹1 or more. The site communicates the purpose and use of funds honestly, receives payment through an eligible Razorpay flow, and displays verified supporter activity. The objective is 1,000 verified supporter profiles in 30 days. Profiles cannot prove distinct human identity.

## 2. Explicit owner decisions
- Landing page, payment link, QR if the chosen account/flow supports it, counters, payer names and amount-ranked leaderboard.
- Default ₹1; supporter may enter a larger amount. No project-level payment cap; separately disclose provider, bank, technical and legal limits when known. Validate monetary values as integer paise, never floating point.
- Razorpay selected. Never publish or use the owner's personal UPI ID, even as fallback. Public privacy is required, not assumed. KYC and lawful disclosure to provider/bank are expected.
- Public display name optional with explicit consent; anonymous otherwise. Never publish payer VPA, phone, email, UTR/RRN, provider IDs or internal payment details.
- Leaderboard ranks supporters by cumulative confirmed value. Verified payments appear without an additional review hold based solely on size. Deal safely with duplicates, refunds and reversals.
- English first; distribute via relevant channels subject to anti-spam rules.
- Non-refundable except genuine errors, subject to applicable law and provider terms. The final wording, support contact and refund process require owner input and legal review.
- No charity/80G, investment, prize, lottery, false urgency or unverified claims. User funds destination must be explained accurately.

## 3. Public workflow and metrics
1. Visitor reads a truthful description, voluntary nature, privacy/refund information and support contact.
2. Visitor selects ₹1 or enters another valid amount and can choose an optional public name. Consent required to publish name.
3. Server starts a payment attempt and creates a provider-approved checkout, payment link or QR. Supporter completes payment in provider-controlled flow. No local fake success constitutes real payment.
4. Site shows pending until server-side verified capture; handle failed, expired, abandoned or delayed payments. Do not expose secret identifiers in URLs or logs.
5. Verified supporter profile, total net verified amount, exact-₹1 count and total payments update; leaderboard reflects cumulative net paid, with a deterministic tie-break to be agreed. Duplicate events do not create duplicate entries.
6. Returning-supporter recovery, handling loss, merge authorization and profile abuse require a design and explicit approval. Until then, supporter profile count is not a unique-person count.
7. Define precise rules for partial/full refunds and disputes, including exact-₹1 count, profile eligibility, ranking, weekly windows and tie-breaks. Never silently erase transaction history.

## 4. Admin requirements
Secure authenticated access; pending/confirmed/refunded/failed views; provider reference for authorized admin only; accurate totals; reconciliation alerts; moderation with appropriate authorization; audit history; export and backups. Actual access design, roles, hosting and retention remain open. Admin must not be able to fake provider capture through a demo approval route.

## 5. Provider and privacy launch gates
- Obtain explicit Razorpay approval for an individual collecting voluntary funds for this exact non-charitable experiment; perform truthful KYC directly with the provider.
- Confirm ₹1 UPI availability, QR/link/API/webhook access, supported amounts, public name, payer-data requirements, pricing, GST, settlements, refunds and chargebacks for the actual account.
- Run real test payments with appropriate test and live modes under owner authorization. Inspect Razorpay pages, QR flow, GPay, PhonePe and Paytm or other supported apps, transaction confirmations and history, SMS/email receipts and support surfaces. Verify the owner's personal name, personal UPI ID, personal email/phone and unwanted identity details do not appear. Block launch if privacy requirement fails.
- Do not mistake a payment-link checkout label, temporary QR or branded VPA for a guarantee of anonymity. The provider and bank know the owner.
- Treat ₹1 as the default, not a guarantee of eligibility. Confirm exact live net fee and avoid unjustified claims about free processing.

## 6. Security, reliability and privacy
- Validate Razorpay webhook signature over exact raw bytes, use timing-safe comparison and secret management, verify capture server-side and match intended payment/amount/currency/account. The existing helper is not a complete implementation.
- Persist transactions and webhook events with database constraints. Processing must be atomic, retry-safe and idempotent with provider IDs; handle duplicates, out-of-order events, ambiguous API timeouts, partial/full refunds, reversals and manual/provider reconciliation.
- Keep sensitive fields minimal, private and access-controlled. Do not log secrets or raw sensitive payment data. Define retention and deletion policy.
- Use production-grade auth, secure cookies, CSRF defense, rate limiting, HTTPS, encryption at rest where appropriate, input validation/output escaping and dependency maintenance. Never use the demo password, fake verification endpoint or ephemeral JSON as production infrastructure.
- Define deployment, migration, backups and restore testing, monitoring/alerts, incident response, reconciliation and rollback before launch.

## 7. MVP acceptance criteria
- Actual provider test mode integration and authorized live ₹1 tests pass for the enabled payment paths; do not promise support for unsupported flows.
- A real confirmed capture is linked to exactly one supporter; duplicate/reordered events do not inflate totals; correct refund/reversal events adjust metrics; failures and pending payments are never counted.
- Repeat contributions can be securely linked to one profile, with transparent handling for anonymous users. Privacy consent is respected.
- Admin cannot turn an unverified claim into a real confirmed payment; access, moderation and audit meet the approved design.
- Provider use-case and display privacy are confirmed; cost, policies, contact, personal-data handling and destination of funds are disclosed.
- Tests, review, backup restore, operational monitoring and owner launch approval are completed and recorded. Until then the product is staging/demo only.

## 8. Open decisions
Provider-approved flow and QR capability; owner-facing public project name and funds use; verified display identity and contact; hosting and transactional database; authenticated recovery and merge; secure admin design; campaign start/time zone and weekly windows; exact refund/leaderboard semantics; retention; consent and final policy wording; owner-approved deployment environment.
