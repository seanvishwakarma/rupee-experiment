'use strict';
const $ = s => document.querySelector(s);
const money = p => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });

async function load() {
  const res = await fetch('/api/demo/admin', { cache: 'no-store' });
  if (!res.ok) {
    $('#dashboard').hidden = true;
    $('#login').hidden = false;
    return;
  }
  const data = await res.json();
  $('#dashboard').hidden = false;
  $('#login').hidden = true;
  $('#pending').textContent = data.records.filter(r => r.status === 'pending').length;
  $('#verified').textContent = data.summary.payments;
  $('#admin-total').textContent = money(data.summary.total);
  const el = $('#records');
  el.replaceChildren();
  if (!data.records.length) {
    el.textContent = 'No contributions yet.';
    return;
  }
  for (const r of data.records) {
    const row = document.createElement('div');
    row.className = 'record';
    const details = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = r.name || 'Anonymous';
    const sub = document.createElement('small');
    const extra = r.razorpayPaymentId ? ` · Razorpay: ${r.razorpayPaymentId}` : '';
    sub.textContent = `${money(r.amount)} · ${r.status.toUpperCase()}${extra} · ${new Date(r.createdAt).toLocaleString()}`;
    details.append(title, sub);
    const actions = document.createElement('div');
    actions.className = 'record-actions';
    const isDemo = !r.razorpayPaymentLinkId;
    const availableActions = r.status === 'pending' ? ['verify', 'reject'] : r.status === 'verified' ? ['refund'] : [];
    for (const action of availableActions) {
      const button = document.createElement('button');
      button.className = 'outline';
      button.textContent = action === 'verify' ? 'Verify' : action === 'reject' ? 'Reject' : 'Mark refunded';
      button.addEventListener('click', async () => {
        button.disabled = true;
        const endpoint = isDemo ? `/api/demo/payments/${r.id}/${action}` : `/api/demo/payments/${r.id}/${action}`;
        const response = await fetch(endpoint, { method: 'POST' });
        if (!response.ok) {
          const x = await response.json();
          $('#admin-error').textContent = x.error;
        } else {
          $('#admin-error').textContent = '';
        }
        await load();
      });
      actions.append(button);
    }
    row.append(details, actions);
    el.append(row);
  }
}

$('#login').addEventListener('submit', async e => {
  e.preventDefault();
  const res = await fetch('/api/demo/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: $('#password').value })
  });
  if (!res.ok) {
    $('#admin-error').textContent = 'Incorrect admin password.';
    return;
  }
  $('#admin-error').textContent = '';
  $('#password').value = '';
  load();
});
$('#refresh').addEventListener('click', load);
load();