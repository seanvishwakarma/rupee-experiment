> **Historical / superseded:** This plan predates the owner’s choice not to use personal UPI and their selection of Razorpay for investigation. For current draft requirements, see [design draft](docs/designs/design_draft.md). Do not implement this historical plan.

# The ₹1 Experiment — Revised Plan v4

Decision log from your latest choices:
- Verification mode: C — Hybrid. Launch with personal UPI + manual verification, then add payment-gateway automation.
- Amount cap: No hard cap. Default is ₹1, but supporters can pay more.
- Goal/duration: 1,000 unique verified supporters in 30 days.
- Public display: immediately after verification, regardless of payment size.
- Identity: optional display name, with an anonymous option.
- Language: English for the first version.
- Refund policy: voluntary contributions are non-refundable except for genuine errors; subject to applicable law.
- Next step: revise the plan before implementation.

## 1. Objective
Build a transparent, mobile-first “₹1 experiment” page where strangers can pay ₹1 or more, appear on a verified leaderboard, and share their rank. The primary success metric is unique verified supporters, not total rupees, so large payments do not distort the core experiment.

Public framing: personal social experiment. Not charity, not investment, not a lottery, not a prize contest.

## 2. Non-negotiable rules
- Only verified payments count toward public counters and leaderboard.
- Pending claims are visible to the payer as “pending”, but not counted publicly.
- Never display supporters’ UPI IDs, phone numbers, emails, UTR/RRN numbers, or bank details publicly. The recipient UPI ID must be available to payers for payment.
- Public display names require consent; anonymous option available.
- No fake scarcity, no misleading charity claims, no cash prizes or lottery-like rewards.
- Refund/error policy must be visible before payment.

## 3. Payment architecture: Hybrid Mode C
### Phase 1: Personal UPI + manual verification
Supporter flow:
1. Choose amount and public display name.
2. Pay using UPI intent button, dynamic QR, or copy-UPI fallback.
3. Submit claim: display name, actual amount paid, UTR/RRN, optional supporter recovery code.
4. Admin matches claim against UPI/bank statement.
5. Approved payment updates counters and leaderboard.

Why: fastest, no gateway KYC, no gateway fee, good for validating the idea.
Weakness: manual verification and possible fake claims. Mitigate with UTR dedupe, amount matching, rate limits, and admin approval.

### Phase 2: Payment gateway + webhook automation
Add Razorpay/Cashfree/another provider only after the use case is approved and KYC is complete.
Flow:
1. Server creates order/payment link with amount and supporter metadata.
2. Supporter pays through checkout.
3. Gateway webhook confirms payment.
4. Server verifies signature, checks payment/order status, prevents replay/duplicate events, and updates ledger.
5. Normal payments auto-approve; unusually large payments can be flagged for review.

Razorpay documentation shows a ₹1 minimum for INR payment links, account setup requires KYC/business details, and best practices recommend Orders API, signature verification, status checks, and webhooks such as payment.captured/order.paid. Re-check provider pricing and acceptable-use rules before launch.

## 4. No-cap policy with safeguards
Because you chose no hard cap:
- Default amount remains ₹1.
- Presets: ₹1, ₹5, ₹11, ₹21, ₹51, ₹101, ₹501, ₹1001, plus custom integer amount.
- For amounts above ₹101, show a confirmation step: “You are about to pay ₹X. This is voluntary and not a purchase or prize entry.”
- All verified payments appear immediately, regardless of size; manual verification itself remains necessary in Phase 1. Monitor unusual activity without imposing a payment cap or an additional display hold.
- Keep separate public metrics:
  - Unique verified supporters.
  - Total verified ₹.
  - Exact-₹1 payment count.
  - Total verified payments.
- Leaderboard boards:
  - All-time total paid.
  - This week total paid.
  - ₹1 Club / exact-₹1 supporters.
  - First 100 supporters.
- Tie-break: earliest verified payment reaching the same total.
- Repeat payments accumulate under the same supporter profile.

## 5. Supporter identity and leaderboard integrity
Display name alone is spoofable. Use supporter profiles:
- First approved claim creates a supporter profile.
- Generate a private recovery code/link.
- Future claims can attach to the same profile using the code.
- Admin can merge duplicate profiles.
- Gateway orders store supporter_id in metadata/notes.
- Public leaderboard shows display name or “Anonymous”, total verified amount, badges, and optional share card.

Badges:
- First 100.
- Top 10.
- King/Queen of the Hill.
- Repeat Supporter.
- ₹1 Club.

## 6. Public page workflow
Sections:
1. Hero: “Can 1,000 strangers send ₹1?”
2. Live counters: supporters, total verified ₹, exact-₹1 count, days left.
3. Amount picker: ₹1 default, presets, custom amount.
4. Name/anonymous choice.
5. Pay button: mobile UPI intent; desktop dynamic QR; fallback copy UPI ID.
6. “I paid” claim form.
7. Pending/verified status for the payer.
8. Leaderboard: all-time, weekly, ₹1 Club.
9. Recent verified supporters ticker.
10. Share card: “I’m #7 — can you beat me?”
11. Rules, transparency note, refund policy, privacy note, contact.
12. Final report template after 30 days.

Important: UPI apps may allow the payer to edit the prefilled amount. The site must count the verified actual amount, not the selected amount.

## 7. Admin dashboard workflow
- Password login.
- Dashboard: visits, claims, pending, approved, rejected, total verified ₹, unique supporters.
- Pending claims queue.
- Claim detail: name, amount, UTR, timestamp, optional screenshot, supporter code.
- Actions: approve, reject, request info, merge supporter, hide name, add manual payment, mark refund/reversal.
- Duplicate UTR/RRN blocks approval.
- Audit log for admin actions.
- CSV export for accounting/final report.
- Settings: UPI ID, payee name, goal, duration, presets, social links, transparency text, refund policy.

## 8. Anti-fraud and reliability controls
- UTR/RRN uniqueness.
- Amount must match actual credit.
- Rate limiting on claims and admin login.
- Honeypot/simple bot check.
- Profanity/impersonation filter for display names.
- Screenshots are supporting evidence, not proof.
- Manual approval in Phase 1.
- Signed webhooks, server-side status checks, idempotency, and reconciliation in Phase 2.
- Refunds/reversals subtract from totals.
- Daily backups and exportable ledger.

## 9. Privacy, legal, tax, and platform hygiene
- Collect minimum data. Public display name only with consent.
- Keep UTR/admin notes private.
- Define retention period and deletion contact.
- This is not a registered charity; do not issue 80G receipts or claim donor tax deductions.
- Keep a ledger of receipts/refunds.
- Indian gift-tax rules may tax aggregate non-relative gifts above ₹50,000 in a financial year; if crossed, the entire aggregate may be taxable, not just the excess. Consult a CA if totals grow.
- Many small UPI credits may trigger bank risk checks; consider a dedicated account and keep records.
- Confirm gateway acceptable-use rules before integrating.
- Follow platform self-promotion rules; no spam.

## 10. Growth workflow
Launch assets:
- Short link to landing page.
- QR image for posts/stories.
- 10–20 second vertical video script.
- X thread, Instagram caption/story, WhatsApp forward, Reddit-safe post where allowed.

Daily loop:
- “Day X: Y supporters, ₹Z verified.”
- Leaderboard movement post.
- Milestone posts: 100, 500, 1,000 supporters.
- Supporter share cards.
- Referral tracking with ?ref= and UTM parameters.

## 11. Implementation phases
Phase 0: approve revised plan.
Phase 1: build MVP in demo/placeholder mode: landing page, UPI QR/intent logic, claim form, admin dashboard, SQLite ledger, leaderboard, share cards.
Phase 2: private test with real UPI ID: test ₹1 across GPay/PhonePe/Paytm/BHIM; verify QR, intent, claim, admin matching, duplicate rejection, mobile layout.
Phase 3: public launch with manual verification.
Phase 4: add gateway automation if volume justifies it.
Phase 5: final report: totals, conversion, top supporters, lessons.

## 12. Acceptance criteria before public launch
- ₹1 payment works on at least 3 UPI apps.
- Desktop QR and mobile UPI intent both work.
- Duplicate UTRs are blocked; unverified claims never enter the public leaderboard. Manual review reduces, but cannot eliminate, fraudulent claims.
- Admin approve/reject updates totals correctly.
- Refund/reversal reduces totals.
- Privacy, refund policy, and rules are visible.
- No placeholder UPI ID remains in production.
- Verified payments appear without an extra high-value display hold.

## 13. Inputs needed from you
Required before real launch:
- UPI ID.
- Payee display name.
- Admin password, or permission to generate one.
- Transparency line: what the experiment is for / where money goes.
- Refund policy wording.

Optional:
- Domain/subdomain.
- Logo/colors.
- Social handles.
- Hindi translation in a later release, if needed.
- Gateway account details later.

## 14. Decisions and remaining details
- Hybrid verification; no hard payment cap; 1,000 unique verified supporters over 30 days.
- Verified payments appear immediately regardless of amount; manual bank-statement matching remains required in Phase 1.
- Optional public display name with an anonymous option; English-only first release.
- Voluntary contributions non-refundable except genuine errors, subject to applicable law. Define a contact and process before launch.
- Remaining choices: whether to add optional tier badges alongside the exact-amount leaderboard, and the campaign’s transparency wording, contact and launch date.
- Implementation remains on hold until you approve the revised plan.

## Sources to re-check before launch
- UPI deep-link parameters: https://github.com/bgagan911/RandomDocs/wiki/NPCI-UPI---Specifications-for-Deep-Linking and https://studylib.net/doc/27265723/upi.linking.specs-ver.1.6
- Razorpay Payment Link minimum ₹1: https://razorpay.com/docs/api/payments/payment-links/create-standard/?preferred-country=IN
- Razorpay account setup/KYC: https://razorpay.com/docs/payments/set-up?preferred-country=IN
- Razorpay webhook/signature best practices: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/best-practices/
- Gift tax threshold explanation: https://www.icici.bank.in/nri-banking/nriedge/nri-articles/tax-implications-in-india-for-nris-on-receiving-gifts and https://taxguru.in/income-tax/gift-cousin-tax-free-income-tax-law.html
