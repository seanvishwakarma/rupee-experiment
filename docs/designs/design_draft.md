# ₹1 Experiment — feature design

**Author:** Owner (name not supplied); drafted by assistant  
**Status:** Draft — not approved; formal Goldfish review not run  
**Date:** 2026-11-13

## Overview
A public campaign page lets people choose ₹1 or more, pay using an approved Razorpay flow, and appear on a supporter leaderboard after a captured payment is verified. A private admin area supports moderation and reconciliation. Public identity protection for the owner is a launch requirement, not a verified property of the chosen provider.

## The Problem
Direct personal UPI can expose the owner's bank-registered name and personal payment address. A new alias or a QR name is not a privacy guarantee. The experiment also needs payment verification to keep invented claims off its counters.

## Goals
- Count unique verified supporter profiles, verified payments, exact-₹1 payments, and verified value; expose no supporter payment identifiers publicly.
- Offer ₹1 as default and a custom higher amount without a project-level cap; acknowledge provider and bank limits.
- Show consenting names or Anonymous and rank supporters by cumulative confirmed value. Publish a verified payment immediately, without an extra amount-based hold.
- Target 1,000 unique verified profiles in 30 days; multiple profiles can belong to one person, so this is not a verified count of distinct humans.
- Verify through independent live tests that the owner’s personal name, phone, email and personal UPI ID are not exposed on payment surfaces before public launch.

## Non-Goals
- Provider anonymity or bypass of KYC, anti-fraud requirements, law, or provider rules.
- Charitable claims, tax receipts, cash prizes, or a guarantee of reaching the goal.
- Direct personal UPI as a live or demo fallback, automatic SMS scraping, unverified self-claims as evidence of payment.
- Live payment collection before the owner approves the design, completes onboarding, and all release gates pass.

## Open Questions
1. Will Razorpay approve this exact voluntary personal social-experiment use case in writing? Are ₹1 UPI payments, dynamic QR, checkout and signed webhooks enabled for this account?
2. What exact names, contact details and payment identifiers appear in each live checkout, UPI confirmation, history, receipt and support flow? What fee, tax, settlement, chargeback and amount limits apply?
3. What is the public experiment name, what happens to funds, what is the support contact and process for genuine errors, and when does the 30-day period begin?
4. What recovery/merge mechanism balances anonymous supporters, repeat payments, abuse resistance, and data minimisation? Until settled, unique supporters are profile counts only.
5. Which storage/hosting, data retention, accessibility target, weekly leaderboard semantics, and campaign-end behavior should be approved? Is a static or dynamic QR supported on the selected account and payment flow?
6. What refund, reversal and dispute states does the chosen provider expose, and how are those reconciled? Which public rounding and refund treatment should be used for partial reversals?

## Critical User Journeys (CUJs)

### CUJ 1: A person contributes
- **Given:** Live launch gates pass and the campaign is active.
- **When:** The person chooses an amount and optional public display name, consents to its display if supplied, and pays through the approved Razorpay experience.
- **Then:** The page shows pending until the server verifies a captured payment; it then updates the counter and leaderboard once. The system does not treat a redirect or screenshot as proof.

### CUJ 2: A supporter returns
- **Given:** A prior supporter has a recovery mechanism that the owner approved.
- **When:** The supporter proves control of the existing profile and completes another verified payment.
- **Then:** The contribution attaches to that profile and the cumulative rank updates. The detailed recovery contract remains an open design decision.

### CUJ 3: A payment is refunded or reversed
- **Given:** A recorded captured payment receives a confirmed refund or reversal.
- **When:** The provider event is verified and reconciled.
- **Then:** The recorded net value and applicable metrics are recalculated; the admin can inspect an audit trail. Exact partial-refund semantics require owner approval.

### CUJ 4: Launch privacy check fails
- **Given:** A test payer sees the owner's identity in a confirmation screen, transaction history, receipt or payment link.
- **When:** The team performs the launch checklist.
- **Then:** Launch remains blocked. Do not replace the flow with a personal UPI ID or misrepresent the identity shown.

## Technical Plan (Architecture)

The following is a **proposal**, not an approved provider-specific implementation contract.

```text
Supporter -> campaign page -> app server -> Razorpay order / link / eligible QR
                                     <- verified webhook and status checks <- Razorpay
                                  -> transaction ledger -> counters / leaderboard
Owner -> authenticated admin -> reconciliation / moderation / audit
```

- UI collects amount and optional display consent. Server creates a unique pending payment attempt and sends the amount in integer paise to the provider. The actual provider API and supported linkage of metadata must be confirmed.
- A server validates the provider's signature using the unmodified request body where required by the provider, verifies captured status, links it to the intended payment attempt, and atomically records one confirmed payment. Treat retries and out-of-order events as normal; reconcile with provider records.
- Public totals derive from recorded captured amounts and confirmed refunds/reversals. Pending, failed and unverified events never count. Internal provider IDs and payer identifiers remain private.
- Supporter display names are untrusted text: enforce size limits and output escaping. Unique profiles are not proof of unique people. Identity and merge policy remain unresolved.
- Site admins can inspect state and perform audited moderation/reconciliation; exact capabilities and authorization design are not yet approved.
- Demo mode uses synthetic payment data and cannot make real payments or silently fall back to a personal UPI address.

## Alternatives Considered

### Razorpay-hosted checkout or payment link
Chosen by the owner for investigation. May allow branded checkout and automated confirmation. It requires KYC and provider approval, and the exact public identity seen across all screens is unknown. Fees and payment options require account-specific confirmation.

### Direct personal UPI
May be easy to set up but can reveal bank-linked identity. Excluded by the owner's explicit requirement.

### Separate business account and merchant QR
May use a bank-verified business identity, but requires account and merchant eligibility checks and does not guarantee privacy. Not selected; revisit only with the owner's consent.

### Crowdfunding platform
Provides hosted campaigns but may restrict acceptable causes, public anonymity, data access and integrations. Not selected; suitability unconfirmed.

## Non-Functional Requirements
- **Privacy:** no personal payment address fallback. Establish public name/display across UPI apps, transaction history, receipts, hosted page, public contact and domain registration. Provider and bank still know the owner. Avoid publishing sensitive payer information.
- **Security:** verified webhooks, least-privilege admin access, secure session management, input validation, CSRF protection where applicable, rate limits, secret rotation and audit events. No real credentials in demo data.
- **Correctness:** atomic deduplication of provider payment identifiers and event IDs; reconcile missing or reordered events. Process refunds without double subtraction. Required database engine and concurrency guarantees are unresolved.
- **Availability and recovery:** deployment must support persistent storage, backups and a restoration test; hosting architecture, recovery objective and capacity remain open.
- **Transparency:** describe the use of funds accurately; provide accessible privacy and genuine-error policies. Obtain applicable legal, tax and provider guidance without claiming a legal opinion.

## Detailed Implementation Plan

**Blocked:** Exact stack, provider flow, data model, hosting and API contracts are not approved. File paths and executable commands are not fabricated. This section cannot yet satisfy EGM implementation-readiness requirements.

Proposed work once decisions are made:
1. Document provider approval, public identity tests, costs and required API permissions.
2. Approve architecture, storage, public metrics and recovery semantics; list exact files, schemas, event state transitions and tests.
3. Build a synthetic-data-only demo after explicit authorisation.
4. Integrate the approved provider flow and test idempotency, refunds, event ordering and recovery.
5. Pass live privacy and ₹1 tests before owner-authorised release.

### Verification Plan
- **Document checks:** inspect all references and mark unresolved items; a same-context check is not an independent Goldfish review.
- **Formal EGM review:** run fresh-context initial zoom-out, comprehension, design/structural/style critique, intermediate zoom-out, and implementation-readiness/codebase review. Resolve and document findings with the owner.
- **Provider tests:** after approval, test ₹1 payment across at least three supported UPI apps; inspect payer screens, transaction histories, receipt emails and support details for personal identifiers. Obtain written confirmation of acceptable use, fees, limits, settlement and enabled QR/link features.
- **Implementation tests:** define actual build, unit, integration, webhook replay, concurrency, refund, end-to-end and backup-restore commands after stack selection. No implementation tests have run.
- **Launch gate:** block real payments if any provider approval, identity test, refund/privacy policy, recovery mechanism, security check or owner approval remains incomplete.

## Additional Resources
- [Concept brief](concepts_brief.md)
- [Provider research and live-test checklist](../research/razorpay-privacy.md)
- [Review status](../reviews/review-status.md)
