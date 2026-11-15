# Review and verification status

Date: 2026-11-13  
Target: `docs/designs/design_draft.md`  
Framework reference: google/elephant-goldfish-model commit `964a4f1ecd333961375c35cb37ed09364dab5e4e`.

## Formal EGM review: NOT RUN
The available host tools do not expose fresh-context native subagent spawning. EGM explicitly requires isolated reviewers and instructs the operator to stop if that capability is unavailable. No zoom-out, comprehension, critic or implementation-readiness Goldfish stage is represented as having run. This is not an approved specification and is not ready for implementation.

## In-context checks (not independent verification)
- The earlier personal-UPI plan contradicts the owner's updated privacy requirement. It is historical and superseded; no personal-UPI fallback is proposed.
- Razorpay is selected for investigation, but use-case approval, account features, public identity display, ₹1 UPI viability and fees are not confirmed.
- Unique supporter counts cannot establish unique humans; recovery and merge semantics are unresolved.
- The detailed design intentionally has no invented file paths, stack, schema, event contracts or test commands. Implementation-readiness cannot pass until those decisions are made.
- A synthetic-data demo now exists after the owner requested coding. No live payment, Razorpay integration or production deployment exists. The automated API test is documented in IMPLEMENTATION.md; it is not a formal Goldfish review.

## How to complete formal review
In a supported host with the whole EGM plugin installed, use a new session, select the EGM review skill and point it at `docs/designs/design_draft.md`. Supply only the draft and its referenced material. Run the five stages with genuinely fresh reviewers, retain their outputs and traceability, and obtain owner decisions on findings. See <https://github.com/google/elephant-goldfish-model> and <https://github.com/google/elephant-goldfish-model/blob/main/docs/codex.md>.

## Findings requiring owner or provider action
1. **Blocker:** Written provider approval for this precise use and reliable identity/privacy tests across payment surfaces.
2. **Blocker:** Specify provider account capabilities, fee/settlement/refund rules and handling of payment events.
3. **Blocker:** Agree supporter identity/recovery, storage, hosting, retention, campaign timing, and refund-contact process before detailed implementation can be approved.
4. **Blocker:** Run and resolve genuine isolated Goldfish reviews in a supported host.

## Executed mechanical checks
- Project Markdown link check: 7 Markdown files read; 10 relative links checked; 0 broken. This does not establish design correctness.
- Upstream EGM repository offline packaging test: `pytest -q tests/unit` at the commit above exited 0; two tests skipped (Copilot offline loader and pinned Cursor bundle). This checks the framework checkout, **not** the project design or independent reviewer isolation.
