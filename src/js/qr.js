import { generateUniqueMemo, sanitizeAccount, setYear, validateHiveAccount, fetchHiveAccountAvatar, debounce } from './utils.js';

const form = document.getElementById('qrForm');
const result = document.getElementById('qrResult');
const qrCanvas = document.getElementById('qrCanvas');
const linkEl = document.getElementById('qrLink');
const downloadBtn = document.getElementById('downloadQr');
const printBtn = document.getElementById('printQr');
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

printBtn.addEventListener('click', () => {
  const printWindow = window.open('', '_blank');
  const qrDataURL = qrCanvas.toDataURL('image/png');
  const accountName = accountNameEl.textContent || 'merchant';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OKpay QR Code - ${accountName}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          margin: 40px; 
          background: white;
        }
        .qr-print { 
          page-break-inside: avoid; 
          margin: 20px auto;
          max-width: 400px;
        }
        .qr-print img { 
          max-width: 300px; 
          height: auto; 
          border: 2px solid #333;
          border-radius: 8px;
        }
        .qr-title { 
          font-size: 24px; 
          font-weight: bold; 
          margin: 10px 0; 
          color: #333;
        }
        .qr-subtitle { 
          font-size: 16px; 
          color: #666; 
          margin: 5px 0 20px;
        }
        .qr-footer { 
          font-size: 12px; 
          color: #999; 
          margin-top: 20px;
        }
        @media print {
          body { margin: 20px; }
          .qr-print { margin: 0 auto; }
        }
      </style>
    </head>
    <body>
      <div class="qr-print">
        <div class="qr-title">Pay ${accountName}</div>
        <div class="qr-subtitle">Scan to pay with Hive</div>
        <img src="${qrDataURL}" alt="Payment QR Code" />
        <div class="qr-footer">Powered by OKpay • menobass.github.io/okpay</div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for image to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
});

setYear(document.getElementById('year'));

// Pre-generate a memo (not used directly for QR link yet), reserved for future embedding.
const memo = generateUniqueMemo();
console.log('Generated memo placeholder (not embedded in QR):', memo);
