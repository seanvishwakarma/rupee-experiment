# Handoff to the next AI agent

**Snapshot:** 13 November 2026  
**Project:** The ₹1 Experiment  
**State:** Local demo plus an unconnected Razorpay helper; not production-ready.

## Read first
1. `AGENTS.md` — standing project constraints and safe operating rules.
2. `docs/HANDOFF_REQUIREMENTS.md` — current product requirements, decisions, unknowns and acceptance criteria. This is the authoritative requirements document.
3. `docs/NEXT_AGENT_WORKPLAN.md` — implementation work, security gates and tests still needed.
4. `docs/designs/design_draft.md` — unapproved design context; Razorpay choice overrides the personal-UPI approach.
5. `docs/research/razorpay-privacy.md` — provider eligibility, identity privacy and test checklist.
6. `IMPLEMENTATION.md` — current prototype setup and limitations.
7. `docs/reviews/review-status.md` — honest status of EGM and mechanical checks.

`PLAN.md` is historical and explicitly superseded. The existing Google Doc may also be stale; the workspace is the handoff source of truth. Do not infer that the Google Doc was updated or approved.

## Current code
- `server.js`: Node HTTP demo server using local JSON storage and simulated payments. It is NOT suitable for production.
- `public/`: responsive landing page and demo dashboard. It uses only simulation; there is no live payment link or QR.
- `src/razorpay.js`: standalone Razorpay Payment Link client and raw-body webhook signature validator; **not connected** to the UI or server.
- `test/`: Node test runner tests using a mock Razorpay client. They do not test a real provider or live checkout.
- `package.json`: no production dependencies, Node 20+, `npm start` and `npm test`.

Run `npm test`; run `npm start`, then open `http://localhost:3000/` and `http://localhost:3000/admin`. Default demo password is `demo-only`. This is insecure by design and must never be exposed as a production admin login. Change it locally with `DEMO_ADMIN_PASSWORD`, but changing it does not make the demo production-ready. Demo records are in `data/demo.json` and are excluded from the zip.

## Latest user instruction
The owner wants a full production-ready MVP where their own Razorpay secrets can be configured locally or on their host. That work is **not done**. Do not claim readiness or accept live money until the gates in the requirements and workplan are met. Do not ask the owner to paste secret keys, webhook secrets, UPI PINs, OTPs or KYC documents into chat; configure secrets privately via host secret management.

## Key decisions
- Razorpay is the selected provider for investigation and integration; this does not mean the provider has approved this use case or that an account exists.
- The owner does not want to publish a personal UPI ID or expose their personal identity to payers. A branded checkout does not guarantee identity privacy. KYC with Razorpay/bank is expected; public privacy must be tested across provider and UPI surfaces.
- English first; ₹1 default; users may choose more; no project-imposed cap, but Razorpay, bank, software and legal limits apply.
- Goal: 1,000 verified supporter profiles in 30 days. This is not proof of 1,000 distinct humans.
- Optional public display name with explicit consent, otherwise anonymous; cumulative amount-ranked leaderboard; verified payments appear without an extra high-value public-display hold.
- Voluntary, not charity or a prize. Non-refundable except genuine errors, subject to applicable law, provider policy and chargebacks. Owner still needs to define a contact and process.
- No personal UPI fallback. The agent must not launch or deploy without explicit owner approval and the provider/privacy/security gates.

## EGM status
The Google Elephant-Goldfish repository was inspected at commit `964a4f1ecd333961375c35cb37ed09364dab5e4e`. EGM's required fresh-context independent reviewer pipeline was **not run** because this environment lacks reviewer subagent tools. The upstream project's offline unit checks passed with two skips; they are not a review of this product. If the next host supports independent subagents, install the whole plugin and run the review against the current design and sources before claiming EGM verification.

## Security and operational warnings
The current demo uses a known default password, in-memory sessions, JSON persistence, simulated verification and no production CSRF/rate limits. Do not expose it publicly or repurpose its endpoints for real payments. Do not ship real-data handling until authentication, authorization, durable transactional persistence, provider confirmation and refund reconciliation, monitoring, HTTPS and independent verification are in place.
