# Razorpay — privacy and eligibility checks

**Status:** Research, not provider approval. Last researched 2026-11-13.

## What documentation establishes
- Razorpay documents INR standard payment links with a minimum of 100 paise: <https://razorpay.com/docs/api/payments/payment-links/create-standard/?preferred-country=IN>. Account-specific UPI and minimum availability still need verification.
- Payment link checkout business name is configurable: <https://razorpay.com/docs/api/payments/payment-links/change-business-name/?preferred-country=IN>. This is not evidence that the legal name is hidden from the UPI payer or receipt.
- Razorpay documents single-use and multiple-use QR codes: <https://razorpay.com/docs/api/qr-codes/entity/?preferred-country=IN>. Availability, minimum, expiry and integration must be checked for the actual account. A single-use QR is not an anonymous UPI account.
- Razorpay onboarding describes KYC: <https://razorpay.com/docs/payments/set-up?preferred-country=IN>. Do not send KYC documents, OTPs or passwords to the assistant.
- Razorpay describes server-side signature and payment status verification: <https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/best-practices/>. Confirm current API/webhook-specific requirements in the provider's current documentation.
- NPCI beneficiary-name rules are reported in <https://www.fortuneindia.com/personal-finance/banking/new-upi-rule-shows-verified-name-before-payment/124482>. Do not assume a QR label overrides the verified name.

## Questions to send Razorpay
1. Will you onboard an individual collecting voluntary, non-charitable contributions for an honestly described social experiment with no goods or services? Confirm in writing under your current policies.
2. For the exact account category and flow, what names, VPAs, emails and phone numbers appear on the hosted page, UPI app confirmation, QR scan, payer history, email receipt and dispute/support pages? Can the public display be an approved project name while KYC remains accurate?
3. Is ₹1 supported for UPI payments on the intended link and QR, and is the relevant QR API enabled? What are the provider and bank upper limits?
4. What are all fees, GST, any fixed minimum charges, settlement delays, holds, refunds, disputes, taxes, and account maintenance charges?
5. Which webhook events, IDs, signatures, capture/status checks, refund events and reconciliation endpoints are available for this account?
6. Can a customer select any amount and can each confirmed payment be correlated with a supporter profile without publicly revealing supporter data? Which customer contact fields are mandatory?

## Live test matrix — not yet executed
After written provider approval and owner consent, conduct actual ₹1 payments from independent test accounts using GPay, PhonePe and Paytm where supported. For each, save redacted evidence of: hosted payment page, QR scan, payee confirmation, completed payment, transaction history and email receipt. Inspect legal name, personal UPI ID, phone, email and other identifiers. Test success, failure, duplicate notification and refund; record provider settlement and fees.

**Release criterion:** Any identity leak, missing use-case approval, unsupported ₹1 flow, unknown fees or unverified confirmation blocks launch. Display the provider-verified payee accurately; never fake or mask its identity in a misleading manner.
