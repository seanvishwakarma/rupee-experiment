'use strict';
const crypto = require('node:crypto');

/**
 * Razorpay API and signature helpers. This module does not store transactions,
 * expose endpoints, or activate payments; a secure persistent application must
 * be implemented and tested before the provider is wired into the UI.
 */
function assertCredentials(keyId, keySecret) {
  if (typeof keyId !== 'string' || !/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) throw new Error('A valid Razorpay key ID is required');
  if (typeof keySecret !== 'string' || keySecret.length < 8) throw new Error('A Razorpay key secret is required');
}
function validSignature(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody)) throw new TypeError('Webhook body must be the exact raw bytes');
  if (typeof secret !== 'string' || !secret || typeof signature !== 'string' || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
function parseWebhook(rawBody, signature, secret, eventId) {
  if (!validSignature(rawBody, signature, secret)) throw new Error('Invalid Razorpay webhook signature');
  if (typeof eventId !== 'string' || !eventId.trim() || eventId.length > 255) throw new Error('Missing or invalid Razorpay event ID');
  let event;
  try { event = JSON.parse(rawBody.toString('utf8')); } catch { throw new Error('Invalid webhook JSON'); }
  if (!event || typeof event.event !== 'string' || typeof event.payload !== 'object' || event.payload === null) throw new Error('Invalid webhook payload');
  // The caller must deduplicate eventId transactionally, confirm payment state,
  // and reconcile refunds before mutating the public ledger.
  return {eventId, event};
}
function createClient({keyId, keySecret, fetchImpl = globalThis.fetch}) {
  assertCredentials(keyId, keySecret);
  if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation required');
  const authorization = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  async function request(method, path, payload) {
    const response = await fetchImpl(`https://api.razorpay.com/v1${path}`, {method, headers:{Authorization:authorization, 'Content-Type':'application/json'}, ...(payload ? {body:JSON.stringify(payload)} : {}), signal:AbortSignal.timeout(10000)});
    let result; try { result=await response.json(); } catch { throw new Error('Razorpay returned an invalid response'); }
    if (!response.ok) { const error=new Error('Razorpay API request failed'); error.status=response.status; error.providerCode=typeof result?.error?.code==='string'?result.error.code:undefined; throw error; }
    return result;
  }
  return {
    async createPaymentLink({amountPaise, referenceId, description = 'Voluntary contribution to the ₹1 Experiment'}) {
      if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) throw new Error('Amount must be an integer of at least 100 paise');
      if (typeof referenceId !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(referenceId)) throw new Error('Invalid reference ID');
      if (typeof description !== 'string' || description.length < 1 || description.length > 255) throw new Error('Invalid description');
      // A unique reference must be saved before making this request. A timeout is
      // ambiguous: reconcile with Razorpay rather than blindly creating again.
      return request('POST','/payment_links',{amount:amountPaise,currency:'INR',accept_partial:false,reference_id:referenceId,description,notify:{sms:false,email:false},reminder_enable:false});
    },
    async fetchPayment(paymentId) {
      if (typeof paymentId !== 'string' || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) throw new Error('Invalid Razorpay payment ID');
      return request('GET',`/payments/${encodeURIComponent(paymentId)}`);
    }
  };
}
module.exports={createClient,validSignature,parseWebhook};
