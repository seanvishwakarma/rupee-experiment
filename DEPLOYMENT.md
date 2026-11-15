# Deployment Guide — ₹1 Experiment

## Overview

Deploy your ₹1 Experiment for free with 24x7 uptime + Cloudflare + catchy free domain.

---

## Step 1: Choose a Free Hosting Platform

### Option A: Koyeb (RECOMMENDED — truly 24x7, no sleep)

| Feature | Details |
|---------|---------|
| Cost | Free forever |
| Uptime | 24x7 (no sleep) |
| Instance | Nano (shared CPU, 512MB RAM) |
| Domain | `your-app.koyeb.app` (free subdomain) |
| Node.js | ✅ Supported |
| Docker | ✅ Supported |

**Deploy on Koyeb:**

1. Push your code to GitHub
2. Go to https://app.koyeb.com/deployments/create
3. Connect your GitHub repository
4. Select the `rupee-experiment` repo
5. Choose "Docker" as the deployment method
6. Add environment variables (see Step 2)
7. Deploy — your app will be live at `https://your-app-name.koyeb.app`

### Option B: Render (free tier sleeps after 15 min)

| Feature | Details |
|---------|---------|
| Cost | Free |
| Uptime | Spins down after 15 min inactivity |
| Domain | `your-app.onrender.com` |

Use Render only if you don't need 24x7 uptime. Use `render.yaml` provided.

---

## Step 2: Configure Environment Variables

Create a `.env` file locally (copy from `.env.example`):

```cmd
copy .env.example .env
```

Then edit `.env` with your Razorpay test credentials:

```ini
RAZORPAY_KEY_ID=rzp_test_your_actual_test_key_id
RAZORPAY_KEY_SECRET=your_actual_test_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
ADMIN_PASSWORD=change-this-to-something-secure
NODE_ENV=production
PORT=3000
```

**Important:** Never commit `.env` to GitHub. It's already in `.gitignore`.

---

## Step 3: Get Your Razorpay Webhook URL

After deployment, your app will be at `https://your-app.koyeb.app`

Your webhook endpoint is: `https://your-app.koyeb.app/api/webhooks/razorpay`

1. Log into Razorpay Dashboard
2. Go to Account & Settings → Webhooks
3. Add webhook endpoint: `https://your-app.koyeb.app/api/webhooks/razorpay`
4. Select events: `payment.captured`, `payment.failed`
5. Copy the webhook secret and add it to your `.env` as `RAZORPAY_WEBHOOK_SECRET`

---

## Step 4: Get a Catchy Free Domain

### Option 1: Koyeb Free Subdomain (easiest)
- Format: `something-koyeb.koyeb.app`
- Example: `rupee-experiment.koyeb.app`
- Cost: Free
- Setup: Automatic in Koyeb dashboard

### Option 2: Freenom (risky — domains often get reclaimed)
- Format: `something.tk`, `.ml`, `.ga`, `.cf`, `.gq`
- Cost: Free
- **Warning:** Freenom domains are frequently suspended. Not recommended for production.

### Option 3: Cloudflare Free Subdomain via Workers/Pages
- Format: `something.workers.dev` or `something.pages.dev`
- Cost: Free
- Setup: Create a Cloudflare Workers project

**Recommended:** Use Koyeb's free `.koyeb.app` subdomain + Cloudflare proxy.

---

## Step 5: Configure Cloudflare (Free)

Cloudflare gives you DNS management, DDoS protection, SSL, and caching — all free.

### If using Koyeb subdomain:

1. Create a free Cloudflare account at https://dash.cloudflare.com
2. Add your Koyeb subdomain as a custom domain in Cloudflare (or just use Koyeb's default SSL)
3. Alternatively, point your domain's DNS to Koyeb via Cloudflare

### If using a Freenom/custom domain:

1. Register domain at Freenom (e.g., `rupee-experiment.tk`)
2. In Cloudflare, add the domain and update nameservers at Freenom
3. In Cloudflare DNS:
   - Create A record: `@` → your server IP
   - Or CNAME: `@` → `your-app.koyeb.app`
4. Enable "Proxy" (orange cloud) on all records
5. SSL/TLS: Set to "Full" or "Flexible"
6. Enable "Always Use HTTPS"

---

## Step 6: Deploy to Koyeb (Detailed)

### Using GitHub integration:

1. Push code to GitHub:
   ```cmd
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rupee-experiment.git
   git push -u origin main
   ```

2. Go to https://app.koyeb.com/deployments/create
3. Select "GitHub" → choose `rupee-experiment` repo → branch `main`
4. Builder: Docker
5. Add environment variables from your `.env`
6. Click "Deploy"
7. Wait for build to complete
8. Your app is live at `https://your-app-name.koyeb.app`

### Using Koyeb CLI:

```bash
# Install Koyeb CLI
# macOS: brew install koyeb
# Windows: scoop install koyeb

# Deploy
koyeb app deploy rupee-experiment --dockerfile Dockerfile
```

---

## Step 7: Test in Production

### 1. Health check
```bash
curl https://your-app.koyeb.app/api/health
```
Expected: `{"ok":true,"mode":"razorpay"}`

### 2. Create a payment link
```bash
curl -X POST https://your-app.koyeb.app/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"name":"Test User","consent":true}'
```
Expected: Returns `paymentLink` URL

### 3. Open the payment link in browser
- Should show Razorpay checkout with **"₹1 Experiment"** (NOT your real name)
- Complete payment in Razorpay test mode
- Should redirect back and show verified payment

### 4. Check admin dashboard
- Visit `https://your-app.koyeb.app/admin`
- Login with your `ADMIN_PASSWORD`
- Should show the verified payment

### 5. Test webhook
- Razorpay will send webhooks to `https://your-app.koyeb.app/api/webhooks/razorpay`
- Check Koyeb logs: https://app.koyeb.com/services/your-app/logs

---

## Step 8: Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Razorpay not configured` | Missing `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Add to env vars in Koyeb dashboard |
| `Webhook secret not configured` | Missing `RAZORPAY_WEBHOOK_SECRET` | Create webhook in Razorpay dashboard, add secret |
| `Invalid webhook signature` | Wrong webhook secret | Double-check secret matches Razorpay dashboard |
| `Payment record not found` | Webhook received before payment link created | Ensure payment link created first, then pay |
| `429 Too many requests` | Rate limiting triggered | Wait 1 minute, or reduce request frequency |
| App sleeps after 15 min | Using Render free tier | Switch to Koyeb (24x7 free) |
| Build fails | Dockerfile issue | Check Koyeb build logs |

---

## Step 9: Privacy Verification (Critical Before Going Live)

You want to hide your real name. Verify these surfaces show **"₹1 Experiment"** not your personal name:

1. ✅ **Razorpay checkout page** — Already changed via Brand Name setting
2. ⬜ **UPI app confirmation** (GPay, PhonePe, Paytm) — Test with real ₹1 payment
3. ⬜ **Email/SMS receipts** — Check what payer receives
4. ⬜ **Transaction history** — Check Razorpay dashboard payer view

**If your personal name appears on any payer-facing surface:** Do NOT go live. Contact Razorpay support to request brand name override on receipts and UPI confirmations.

---

## Step 10: Go Live Checklist

- [ ] `.env` configured with Razorpay test credentials
- [ ] Webhook secret added to Razorpay dashboard
- [ ] Webhook endpoint URL added to Razorpay dashboard
- [ ] App deployed to Koyeb (24x7 free)
- [ ] Cloudflare configured (SSL + proxy)
- [ ] Health check passes: `/api/health`
- [ ] Test ₹1 payment completes successfully
- [ ] Admin dashboard accessible and functional
- [ ] Privacy verified: checkout shows "₹1 Experiment", not your real name
- [ ] Test UPI receipts don't leak personal info
- [ ] Admin password changed from default

---

## File Structure After Deployment

```
rupee-experiment/
├── Dockerfile              # Container definition
├── .dockerignore           # Files to exclude from Docker
├── koyeb.yaml              # Koyeb deployment config
├── render.yaml             # Render deployment config
├── .env.example            # Environment template (copy to .env)
├── .gitignore              # Git ignore rules
├── DEPLOYMENT.md           # This file
├── package.json            # Node.js project config
├── server.js               # Main server (Razorpay integrated)
├── src/razorpay.js         # Razorpay API client
├── public/index.html       # Landing page
├── public/app.js           # Frontend logic
├── public/admin.html       # Admin dashboard
├── public/admin.js         # Admin logic
├── public/style.css        # Styles
├── test/                   # Test files
├── docs/                   # Documentation
└── data/                   # Data directory (created at runtime)
```

---

## Support

If you encounter issues:
1. Check Koyeb logs: https://app.koyeb.com/services/YOUR_APP/logs
2. Check Razorpay dashboard: Webhooks → Event logs
3. Test locally first: `npm start` then visit `http://localhost:3000`