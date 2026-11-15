'use strict';
const $ = s => document.querySelector(s);
const money = p => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const format = n => n.toLocaleString('en-IN');

let checkoutMode = null; // 'razorpay' | 'demo'

async function detectMode() {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    const data = await res.json();
    const isTest = data.mode === 'razorpay-test';
    const isLive = data.mode === 'razorpay';
    checkoutMode = (isTest || isLive) ? 'razorpay' : 'demo';
    const banner = $('.demo-banner');
    if (banner) {
      if (isTest) {
        banner.textContent = 'TEST MODE · Razorpay test integration · No real money will be charged';
      } else if (isLive) {
        banner.textContent = 'LIVE · Real contributions enabled via Razorpay';
      } else {
        banner.textContent = 'DEMO MODE · No real payments. All activity is simulated.';
      }
    }
  } catch (e) {
    checkoutMode = 'demo';
  }
}

async function refresh() {
  try {
    const data = await fetch('/api/summary', { cache: 'no-store' }).then(r => r.json());
    $('#supporters').textContent = format(data.supporters);
    $('#total').textContent = money(data.total);
    $('#ones').textContent = format(data.oneRupee);
    const board = $('#board-body');
    board.replaceChildren();
    if (!data.leaderboard.length) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = 'No verified contributions yet. Be the first to take part ↗';
      board.append(e);
      return;
    }
    data.leaderboard.forEach((r, i) => {
      const row = document.createElement('div');
      row.className = 'board-row';
      const rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = String(i + 1).padStart(2, '0');
      const name = document.createElement('span');
      name.className = 'board-name';
      const avatar = document.createElement('i');
      avatar.textContent = r.name.charAt(0).toUpperCase();
      const text = document.createElement('b');
      text.textContent = r.name;
      name.append(avatar, text);
      const amount = document.createElement('strong');
      amount.textContent = money(r.amount);
      row.append(rank, name, amount);
      board.append(row);
    });
  } catch (e) { console.error('Unable to load totals', e); }
}

const input = $('#custom');
function update() {
  document.querySelectorAll('.amount').forEach(b => b.classList.toggle('active', b.dataset.value === input.value));
  const n = Number(input.value);
  $('#large-warning').hidden = !(n > 101);
  $('#large-warning').textContent = n > 101
    ? `You are contributing ₹${n.toLocaleString('en-IN')}. Contributions are voluntary; this is not a purchase or prize entry.`
    : '';
}
document.querySelectorAll('.amount').forEach(b => b.addEventListener('click', () => {
  input.value = b.dataset.value;
  update();
}));
input.addEventListener('input', update);

$('#payment-form').addEventListener('submit', async e => {
  e.preventDefault();
  const rupees = Number(input.value);
  const message = $('#message');
  if (!Number.isSafeInteger(rupees) || rupees < 1 || !Number.isSafeInteger(rupees * 100)) {
    message.textContent = 'Enter a whole-rupee amount of ₹1 or more.';
    return;
  }
  const name = $('#name').value.trim();
  if (name && !$('#consent').checked) {
    message.textContent = 'Please consent to publishing your display name, or leave it blank.';
    return;
  }

  const button = e.submitter;
  button.disabled = true;
  try {
    if (checkoutMode === 'razorpay') {
      // Create a real Razorpay payment link
      const resp = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: rupees * 100, name, consent: $('#consent').checked })
      });
      const data = await resp.json();
      if (!resp.ok) throw Error(data.error || 'Unable to create payment link');
      message.textContent = 'Redirecting to Razorpay checkout…';
      // Redirect payer to Razorpay-hosted checkout
      window.location.href = data.paymentLink;
    } else {
      // Demo mode — simulated submission
      const resp = await fetch('/api/demo/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: rupees * 100, name, consent: $('#consent').checked })
      });
      const data = await resp.json();
      if (!resp.ok) throw Error(data.error);
      message.textContent = 'Demo contribution submitted! It will appear once approved in the demo dashboard.';
      $('#name').value = '';
      $('#consent').checked = false;
    }
  } catch (err) {
    message.textContent = err.message || 'Could not submit. Please try again.';
  } finally {
    button.disabled = false;
  }
});

detectMode().then(refresh);
setInterval(refresh, 15000);