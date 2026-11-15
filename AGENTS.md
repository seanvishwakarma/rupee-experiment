# Agent instructions

## Scope and authority
- The owner requested a production MVP; a local synthetic demo and unconnected Razorpay helper exist. Continue implementation upon the owner’s instruction, but do not deploy, register accounts, use real money, or launch without explicit approval and the documented release gates.
- Read `HANDOFF.md`, `docs/HANDOFF_REQUIREMENTS.md`, `docs/NEXT_AGENT_WORKPLAN.md`, `docs/designs/design_draft.md` and `docs/research/razorpay-privacy.md` first. Current requirements override the historical `PLAN.md` wherever they conflict.
- The owner chose Razorpay as the provider to investigate; live approval, public privacy and ₹1 viability are not established. Never use a personal UPI ID as a fallback.
- No claims that anonymity from Razorpay, banks or authorities is possible; KYC and truthful disclosure are mandatory.
- Keep secrets, KYC documents and UPI credentials out of this repository, logs and public outputs. Never request or store UPI PINs or OTPs.
- Do not expose supporters' sensitive identifiers; names are optional and only shown with consent.
- Only confirmed captured transactions count. Verify signatures server-side, make event handling idempotent, and account for refunds and reversals.
- Default ₹1; owner has chosen no project-level cap, although payment-provider, bank and technical limits apply. No special public display hold by amount after verification.
- Record unanswered decisions explicitly. Mark proposals and unverified claims as such; do not invent APIs, project files, prices, legal assurances or provider approvals.
- Follow the EGM workflow only when the host supports its required capabilities. Fresh-context Goldfish review is mandatory for formal EGM verification. Never label a same-context self-check as an independent review.
- Keep findings, evidence, and owner decisions in `docs/reviews/`. Do not claim tests ran without recording commands and outcomes.
