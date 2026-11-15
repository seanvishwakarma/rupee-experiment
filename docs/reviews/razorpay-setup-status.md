# Razorpay Setup Status — 2026-11-15

## What was done in the Razorpay dashboard

### 1. Brand name changed ✅
- **Before:** Checkout showed "ADITYA MAHESH VISHWAKARMA" (your real name)
- **After:** Checkout now shows "₹1 Experiment"
- **Location:** Account & Settings → Checkout Styling → Brand Name and Logo → Edit → Text only
- **Effect:** Payers now see "₹1 Experiment" on Razorpay checkout screens and UPI apps instead of your personal name

### 2. Test Mode activated ✅
- Dashboard switched to Test Mode
- Only test data is shown; no real money moves

### 3. Test API credentials obtained ✅
- Viewed test API keys from Account & Settings → Websites & API keys → View test API keys
- Credentials copied to clipboard (not stored in chat or source control)
- Live API keys require website approval (24-48 hours); test keys available immediately

### 4. Account details observed
- Account ID: acc_Pz8ZzXV1lxPphG
- Merchant ID: Pz8ZzXV1lxPphG
- Phone: +91 9619 955692
- Email: seanvishwakarma@gmail.com
- UPI: Enabled (Google Pay, PhonePe, Paytm, BHIM, CRED, etc. all supported)

## Code changes made

| File | Change |
|------|--------|
| `server.js` | Rewrote to integrate Razorpay: creates real payment links, handles webhooks with signature verification, idempotent event processing, demo fallback |
| `src/razorpay.js` | Already existed — Razorpay client + webhook validator (now wired into server) |
| `public/app.js` | Redirects payer to Razorpay checkout when in test mode; demo fallback otherwise |
| `public/index.html` | Updated copy to reflect real Razorpay payments |
| `public/admin.js` | Updated to show Razorpay payment IDs on records |
| `public/admin.html` | Updated demo banner and hint text |
| `.env.example` | New — template for Razorpay credentials |
| `.gitignore` | New — excludes .env, data/, node_modules |
| `package.json` | Updated description |
| `docs/reviews/razorpay-setup-status.md` | New — this file |

## What you need to do next

### 1. Configure environment variables
```cmd
copy .env.example .env
```
Then edit `.env` and paste your test credentials:
- `RAZORPAY_KEY_ID` — your `rzp_test_...` key ID
- `RAZORPAY_KEY_SECRET` — your test secret (shown once in dashboard)
- `RAZORPAY_WEBHOOK_SECRET` — create a webhook secret in Razorpay Dashboard
- `ADMIN_PASSWORD` — change from `change-me`

### 2. Run the app
```cmd
npm start
```
Visit `http://localhost:3000/` — health endpoint at `/api/health` will show `mode: razorpay-test`

### 3. Test the flow
1. Contribute ₹1 → redirected to Razorpay checkout showing "₹1 Experiment"
2. Complete payment in test mode → webhook confirms → appears on leaderboard
3. Admin dashboard at `/admin` to verify/reject/refund

### 4. Privacy verification (before going live)
Per the project requirements, you must verify that your personal name, phone, email, and UPI ID do NOT appear on any payer-facing surface (checkout, UPI confirmation, receipt, transaction history). The brand name change addresses the checkout display name, but Razorpay receipts and UPI app confirmations may still show your KYC-registered details. Test this carefully.

### 5. Go live (when approved)
- Get website approved in Razorpay dashboard (24-48 hours)
- Generate live API keys
- Update `.env` with live keys
- Set up webhook endpoint pointing to `/api/webhooks/razorpay`
- Complete KYC with Razorpay directly

## Important constraints (from project AGENTS.md)
- Never share your Razorpay credentials, KYC documents, UPI PINs, or OTPs
- KYC and truthful disclosure to Razorpay/bank are mandatory — no anonymity from providers
- Do not use a personal UPI ID as a fallback
- Any identity leak on payer surfaces blocks launch
- Do not accept real money until all release gates in docs/HANDOFF_REQUIREMENTS.md are met