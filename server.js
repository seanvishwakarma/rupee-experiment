'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// ── Load .env file if present (no external dependency) ─────────
function loadEnv() {
  const envFile = path.join(__dirname, '.env');
  try {
    const content = fs.readFileSync(envFile, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^"(.*)"$/, '$1');
      if (key && process.env[key] === undefined) process.env[key] = val;
    }
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn('Could not load .env:', err.message);
  }
}
loadEnv();

const { createClient, validSignature, parseWebhook } = require('./src/razorpay');

const base = __dirname;
const dataFile = process.env.DATA_FILE || path.join(base, 'data', 'demo.json');
const adminPassword = process.env.DEMO_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'change-me';
const sessions = new Map();
let records = [];

try {
  const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  if (Array.isArray(parsed)) records = parsed;
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

function save() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  const tmp = dataFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(records, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, dataFile);
}

function summary() {
  const paid = records.filter(r => r.status === 'verified');
  const rows = new Map();
  for (const r of paid) {
    const key = r.id;
    rows.set(key, { id: key, name: r.name || 'Anonymous', amount: r.amount, verifiedAt: r.verifiedAt });
  }
  return {
    supporters: rows.size,
    total: paid.reduce((n, r) => n + r.amount, 0),
    oneRupee: paid.filter(r => r.amount === 100).length,
    payments: paid.length,
    leaderboard: [...rows.values()]
      .sort((a, b) => b.amount - a.amount || a.verifiedAt.localeCompare(b.verifiedAt))
      .slice(0, 50),
    recent: paid.slice().reverse().slice(0, 5).map(r => ({ name: r.name || 'Anonymous', amount: r.amount }))
  };
}

function findRecord(id) { return records.find(r => r.id === id); }
function findRecordByRazorpayPaymentId(paymentId) {
  return records.find(r => r.razorpayPaymentId === paymentId);
}

// ── Simple in-memory rate limiter ─────────────────────────────
const rateLimitMap = new Map();
function rateLimit(ip, maxRequests = 30, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + windowMs;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count <= maxRequests;
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function json(res, status, data, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(JSON.stringify(data));
}

function body(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', chunk => {
      s += chunk;
      if (s.length > 65536) { reject(new Error('Request too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(s ? JSON.parse(s) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function authorized(req) {
  const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('admin_session='))?.slice(14);
  const expiry = sessions.get(token);
  if (!expiry || expiry < Date.now()) { if (token) sessions.delete(token); return false; }
  return true;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  return !origin || origin === `http://${req.headers.host}` || origin === `https://${req.headers.host}`;
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml'
};

let razorpayClient = null;
try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret && /^rzp_(test|live)_/.test(keyId)) {
    razorpayClient = createClient({ keyId, keySecret });
    console.log('Razorpay client initialized (mode:', keyId.startsWith('rzp_test_') ? 'test' : 'live', ')');
  } else if (keyId && keySecret) {
    console.warn('Razorpay credentials present but key format unrecognized — payments disabled');
  } else {
    console.warn('No Razorpay credentials found — running in demo-only mode');
  }
} catch (err) {
  console.warn('Razorpay client not initialized:', err.message);
}

async function handler(req, res) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(ip)) return json(res, 429, { error: 'Too many requests. Please slow down.' });

    const url = new URL(req.url, 'http://local');

    // Origin check for non-GET
    if (req.method !== 'GET' && !sameOrigin(req)) return json(res, 403, { error: 'Invalid origin' });

    // ── Health ──────────────────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/health') {
      const mode = razorpayClient
        ? (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'razorpay-test' : 'razorpay')
        : 'demo-only';
      return json(res, 200, { ok: true, mode });
    }

    // ── Summary (public) ────────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/summary') return json(res, 200, summary());

    // ── Create a Razorpay payment link ──────────────────────
    if (req.method === 'POST' && url.pathname === '/api/payments') {
      if (!razorpayClient) return json(res, 503, { error: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });

      const input = await body(req);
      const amount = Number(input.amount);
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      const consent = input.consent === true;

      if (!Number.isSafeInteger(amount) || amount < 100) {
        return json(res, 400, { error: 'Enter an amount of at least ₹1 in whole rupees.' });
      }
      if (name.length > 40) return json(res, 400, { error: 'Name must be 40 characters or fewer.' });
      if (name && !consent) return json(res, 400, { error: 'Consent is required to publish a name.' });

      const attemptId = crypto.randomUUID();
      const referenceId = `attempt_${attemptId.replace(/-/g, '')}`.slice(0, 40);

      try {
        const link = await razorpayClient.createPaymentLink({
          amountPaise: amount,
          referenceId,
          description: 'Voluntary contribution to the ₹1 Experiment'
        });

        const record = {
          id: attemptId,
          attemptId,
          name,
          amount,
          consent,
          status: 'pending',
          razorpayPaymentLinkId: link.id,
          razorpayPaymentLinkShortUrl: link.short_url,
          razorpayPaymentId: null,
          createdAt: new Date().toISOString()
        };
        records.push(record);
        save();

        return json(res, 201, {
          id: attemptId,
          status: 'pending',
          paymentLink: link.short_url,
          paymentLinkId: link.id
        });
      } catch (err) {
        console.error('Razorpay payment link creation failed:', err.message);
        return json(res, 502, { error: 'Unable to create payment link. Please try again.' });
      }
    }

    // ── Razorpay webhook ────────────────────────────────────
    if (req.method === 'POST' && url.pathname === '/api/webhooks/razorpay') {
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        return json(res, 500, { error: 'Webhook secret not configured' });
      }

      const signature = req.headers['x-razorpay-signature'];
      const raw = await rawBody(req);

      let event;
      try {
        event = parseWebhook(raw, signature, process.env.RAZORPAY_WEBHOOK_SECRET, crypto.randomUUID());
      } catch (err) {
        console.warn('Invalid webhook:', err.message);
        return json(res, 400, { error: 'Invalid webhook signature' });
      }

      const eventId = event.event.id;
      const eventType = event.event.event;
      const payload = event.event.payload;

      // Idempotency: skip already-processed events
      if (records.some(r => r.webhookEventId === eventId)) {
        return json(res, 200, { ok: true, duplicate: true });
      }

      try {
        if (eventType === 'payment.captured' || eventType === 'payment_link.paid') {
          const paymentEntity = payload.payment?.entity;
          const plinkEntity = payload.payment_link?.entity;
          const paymentId = paymentEntity?.id;
          const plinkId = plinkEntity?.id || (paymentEntity?.description?.startsWith('#') ? 'plink_' + paymentEntity.description.slice(1) : null);
          const amount = paymentEntity?.amount || plinkEntity?.amount_paid || plinkEntity?.amount;
          const currency = paymentEntity?.currency || plinkEntity?.currency || 'INR';

          let record = null;
          if (paymentId) record = records.find(r => r.razorpayPaymentId === paymentId);
          if (!record && plinkId) record = records.find(r => r.razorpayPaymentLinkId === plinkId);
          if (!record && plinkEntity?.reference_id) {
            record = records.find(r => r.attemptId === plinkEntity.reference_id || r.attemptId.replace(/-/g, '') === plinkEntity.reference_id);
          }
          if (!record && paymentEntity?.notes?.reference_id) {
            const ref = paymentEntity.notes.reference_id.replace('attempt_', '');
            record = records.find(r => r.attemptId === ref || r.attemptId.replace(/-/g, '') === ref);
          }

          if (!record) {
            console.warn('Webhook received for unknown payment/link:', { eventType, paymentId, plinkId });
            return json(res, 404, { error: 'Payment record not found' });
          }

          if (currency !== 'INR') {
            console.warn('Non-INR payment captured:', currency);
            return json(res, 400, { error: 'Unsupported currency' });
          }

          record.razorpayPaymentId = paymentId || record.razorpayPaymentId;
          if (plinkId) record.razorpayPaymentLinkId = plinkId;
          record.webhookEventId = eventId;
          record.status = 'verified';
          record.verifiedAt = record.verifiedAt || new Date().toISOString();
          record.razorpayAmount = amount || record.amount;
          record.razorpayCurrency = currency;
          save();
          console.log(`Payment verified: ${record.razorpayPaymentId || record.razorpayPaymentLinkId} ₹${record.amount / 100}`);
        } else if (eventType === 'payment.failed') {
          const paymentEntity = payload.payment?.entity;
          if (paymentEntity) {
            const paymentId = paymentEntity.id;
            const plinkId = paymentEntity.description?.startsWith('#') ? 'plink_' + paymentEntity.description.slice(1) : null;
            let record = records.find(r => r.razorpayPaymentId === paymentId);
            if (!record && plinkId) record = records.find(r => r.razorpayPaymentLinkId === plinkId);
            if (!record && paymentEntity.notes?.reference_id) {
              const ref = paymentEntity.notes.reference_id.replace('attempt_', '');
              record = records.find(r => r.attemptId === ref || r.attemptId.replace(/-/g, '') === ref);
            }
            if (record) {
              record.razorpayPaymentId = paymentId;
              record.webhookEventId = eventId;
              record.status = 'failed';
              save();
              console.log(`Payment failed: ${paymentId}`);
            }
          }
        }

        return json(res, 200, { ok: true });
      } catch (err) {
        console.error('Webhook processing error:', err.message);
        return json(res, 500, { error: 'Webhook processing failed' });
      }
    }

    // ── Demo-only routes (simulated, not real payments) ─────
    if (req.method === 'POST' && url.pathname === '/api/demo/payments') {
      const input = await body(req);
      const amount = Number(input.amount);
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      if (!Number.isSafeInteger(amount) || amount < 100) return json(res, 400, { error: 'Enter an amount of at least ₹1 in whole paise.' });
      if (name.length > 40) return json(res, 400, { error: 'Name must be 40 characters or fewer.' });
      if (name && input.consent !== true) return json(res, 400, { error: 'Consent is required to publish a name.' });
      const r = { id: crypto.randomUUID(), name, amount, status: 'pending', createdAt: new Date().toISOString() };
      records.push(r); save();
      return json(res, 201, { id: r.id, status: r.status });
    }

    if (req.method === 'POST' && url.pathname === '/api/demo/login') {
      const input = await body(req);
      if (typeof input.password !== 'string' || input.password !== adminPassword) return json(res, 401, { error: 'Incorrect admin password' });
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, Date.now() + 3600000);
      return json(res, 200, { ok: true }, { 'Set-Cookie': `admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600` });
    }

    if (req.method === 'GET' && url.pathname === '/api/demo/admin') {
      if (!authorized(req)) return json(res, 401, { error: 'Sign in required' });
      return json(res, 200, { records: records.slice().reverse(), summary: summary() });
    }

    const match = url.pathname.match(/^\/api\/demo\/payments\/([a-f0-9-]+)\/(verify|reject|refund)$/);
    if (req.method === 'POST' && match) {
      if (!authorized(req)) return json(res, 401, { error: 'Sign in required' });
      const r = findRecord(match[1]);
      if (!r) return json(res, 404, { error: 'Payment not found' });
      const action = match[2];
      if ((action === 'verify' || action === 'reject') && r.status !== 'pending') return json(res, 409, { error: 'Action not valid for this payment.' });
      if (action === 'refund' && r.status !== 'verified') return json(res, 409, { error: 'Action not valid for this payment.' });
      r.status = action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'refunded';
      if (action === 'verify') r.verifiedAt = new Date().toISOString();
      save();
      return json(res, 200, { ok: true, status: r.status });
    }

    // ── Static files ────────────────────────────────────────
    if (req.method === 'GET') {
      const pages = { '/': 'index.html', '/admin': 'admin.html', '/style.css': 'style.css', '/app.js': 'app.js', '/admin.js': 'admin.js' };
      const file = pages[url.pathname];
      if (file) {
        res.writeHead(200, {
          'Content-Type': mime[path.extname(file)],
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'none'"
        });
        return fs.createReadStream(path.join(base, 'public', file)).pipe(res);
      }
    }

    return json(res, 404, { error: 'Not found' });
  } catch (e) {
    if (!res.headersSent) return json(res, 400, { error: e.message === 'Invalid JSON' ? e.message : 'Unable to process request' });
  }
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = http.createServer(handler).listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Mode: ${razorpayClient ? 'Razorpay integration' : 'Demo-only (no Razorpay credentials)'}`);
    console.log(`Admin password: ${adminPassword === 'change-me' ? 'change-me (change before sharing)' : 'set by environment'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

module.exports = { handler, summary };