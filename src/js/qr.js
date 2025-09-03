import { generateUniqueMemo, sanitizeAccount, setYear, validateHiveAccount, fetchHiveAccountAvatar, debounce } from './utils.js';

const form = document.getElementById('qrForm');
const result = document.getElementById('qrResult');
const qrCanvas = document.getElementById('qrCanvas');
const linkEl = document.getElementById('qrLink');
const downloadBtn = document.getElementById('downloadQr');
const receivingInput = document.getElementById('qrReceivingAccount');
const avatarImg = document.getElementById('qrAccountAvatar');
const accountNameEl = document.getElementById('qrAccountName');
const accountVisual = document.getElementById('qrAccountVisual');
const accountStatus = document.getElementById('qrAccountStatus');

let qr;
function ensureQrInstance() {
  if (!qr) {
    // global QRious from CDN
    qr = new QRious({ element: qrCanvas, size: 240, value: '' });
  }
  return qr;
}

let lastValidationTarget = '';
async function handleAccountChange() {
  const acct = sanitizeAccount(receivingInput.value);
  if (!acct) {
    accountVisual.classList.add('hidden');
    if (accountStatus) { accountStatus.textContent=''; accountStatus.className='account-status'; }
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
}

receivingInput.addEventListener('input', debounce(() => { handleAccountChange(); }, 300));

function buildPaymentUrl({ to }) {
  const url = new URL('http://menobass.github.io/okpay');
  if (to) url.searchParams.set('vendor', to);
  return url.toString();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const to = sanitizeAccount(receivingInput.value);
  const paymentUrl = buildPaymentUrl({ to });
  ensureQrInstance().value = paymentUrl;
  linkEl.href = paymentUrl;
  linkEl.textContent = paymentUrl;
  result.classList.remove('hidden');
});

downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = `okpay-${Date.now()}.png`;
  a.href = qrCanvas.toDataURL('image/png');
  a.click();
});

setYear(document.getElementById('year'));

// Pre-generate a memo (not used directly for QR link yet), reserved for future embedding.
const memo = generateUniqueMemo();
console.log('Generated memo placeholder (not embedded in QR):', memo);
