import { parseQuery, generateUniqueMemo, debounce, sanitizeAccount, setYear, fetchHiveAccountAvatar, usdToHbd, buildKeychainTransfer, fallbackHiveSigner, validateHiveAccount } from './utils.js';

const form = document.getElementById('payment-form');
const receivingInput = document.getElementById('receivingAccount');
const amountInput = document.getElementById('amountUsd');
const payBtn = document.getElementById('payBtn');
const memoEl = document.getElementById('memoValue');
const avatarImg = document.getElementById('account-avatar');
const accountNameEl = document.getElementById('account-name');
const accountVisual = document.getElementById('account-visual');
const accountStatus = document.getElementById('accountStatus');

// Session-persistent memo
let memo = sessionStorage.getItem('okpay_memo');
if (!memo) {
  memo = generateUniqueMemo();
  sessionStorage.setItem('okpay_memo', memo);
}

async function init() {
  setYear(document.getElementById('year'));
  memoEl.textContent = memo;
  const q = parseQuery();
  if (q.vendor) {
    receivingInput.value = sanitizeAccount(q.vendor);
    handleAccountChange();
  }
  if (q.to) {
    receivingInput.value = sanitizeAccount(q.to);
    handleAccountChange();
  }
  if (q.amount) {
    amountInput.value = q.amount;
  }
  validate();
}

function validate() {
  const acct = sanitizeAccount(receivingInput.value);
  const amt = parseFloat(amountInput.value);
  const isValidState = accountStatus && accountStatus.classList.contains('ok');
  const ok = isValidState && acct.length >= 3 && !isNaN(amt) && amt > 0;
  payBtn.disabled = !ok;
}

let lastValidationTarget = '';
async function handleAccountChange() {
  const acct = sanitizeAccount(receivingInput.value);
  if (!acct) {
    accountVisual.classList.add('hidden');
    if (accountStatus) { accountStatus.textContent=''; accountStatus.className='account-status'; }
    validate();
    return;
  }
  lastValidationTarget = acct;
  if (accountStatus) { accountStatus.textContent='Checking account…'; accountStatus.className='account-status checking'; }
  const res = await validateHiveAccount(acct);
  if (acct !== lastValidationTarget) return; // stale
  if (!res.valid) {
    accountVisual.classList.add('hidden');
    if (accountStatus) {
      accountStatus.textContent = res.reason === 'Not found' ? 'Account not found' : 'Invalid account';
      accountStatus.className = 'account-status error';
    }
  } else {
    avatarImg.src = await fetchHiveAccountAvatar(acct);
    accountNameEl.textContent = acct;
    accountVisual.classList.remove('hidden');
    if (accountStatus) { accountStatus.textContent='Account valid'; accountStatus.className='account-status ok'; }
  }
  validate();
}

receivingInput.addEventListener('input', debounce(() => { handleAccountChange(); validate(); }, 300));
amountInput.addEventListener('input', () => validate());

form.addEventListener('submit', (e) => {
  e.preventDefault();
  validate();
  if (payBtn.disabled) return;
  const to = sanitizeAccount(receivingInput.value);
  const amountUsd = parseFloat(amountInput.value);
  const amountHBD = usdToHbd(amountUsd); // 1:1 conversion

  const transfer = buildKeychainTransfer({ to, amountHBD, memo });

  if (transfer.method === 'extension') {
    // Use Keychain extension API
    window.hive_keychain.requestTransfer(null, to, amountHBD.toFixed(3), memo, 'HBD', (response) => {
      if (response.success) {
        alert('Payment successful!');
      } else {
        alert('Payment failed: ' + response.message);
      }
    });
  } else {
    // Fallback to deep link + HiveSigner
    let navigated = false;
    const timer = setTimeout(() => {
      if (!navigated) {
        window.location.href = fallbackHiveSigner({ to, amountHBD, memo });
      }
    }, 1200);

    window.location.href = transfer.url;
    navigated = true;
  }
});

init();
