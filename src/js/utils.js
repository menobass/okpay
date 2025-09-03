// Utility functions for OKpay

export function parseQuery() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

export function generateUniqueMemo() {
  // Generate memo in format: kcs-hpos-xxxx-xxxx (8 random digits total)
  const part1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const part2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `kcs-hpos-${part1}-${part2}`;
}

export function debounce(fn, delay = 350) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

export function sanitizeAccount(input) {
  return input.trim().toLowerCase().replace(/[^a-z0-9\-.]/g, '').slice(0,16); // Basic constraint
}

export function setYear(el) {
  const y = new Date().getFullYear();
  if (el) el.textContent = y;
}

export function buildKeychainTransfer({ to, amountHBD, memo }) {
  // Hive Keychain link (uses keychain:// or https fallback). Amount must have 3 decimals.
  const amountStr = Number(amountHBD).toFixed(3) + ' HBD';
  const op = encodeURIComponent(JSON.stringify(["transfer", { from: "<FROM>", to, amount: amountStr, memo }]));
  // NOTE: <FROM> replaced by Keychain extension automatically when using requestHandshake, but for deep link we can't know.
  // We'll use a redirect that allows user to pick inside Keychain.
  // Keychain deep link pattern example (subject to change):
  // keychain://requestBroadcast?operations=[[...]]
  return `keychain://requestBroadcast?operations=${op}`;
}

export function fallbackHiveSigner({ to, amountHBD, memo }) {
  const amountStr = Number(amountHBD).toFixed(3) + ' HBD';
  const url = new URL('https://hivesigner.com/sign/transfer');
  url.searchParams.set('to', to);
  url.searchParams.set('amount', amountStr);
  url.searchParams.set('memo', memo);
  return url.toString();
}

export async function fetchHiveAccountAvatar(account) {
  // Using endpoints that return images directly could be: https://images.hive.blog/u/<user>/avatar
  // We'll attempt that first; no fetch needed—can set img src directly.
    return `https://images.hive.blog/u/${account}/avatar/original`;
}

export async function fetchAccounts(accounts, { endpoint = 'https://api.hive.blog' } = {}) {
  if (!accounts?.length) return [];
  const body = { jsonrpc: '2.0', method: 'condenser_api.get_accounts', params: [accounts], id: 1 };
  try {
    const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
    if (!res.ok) throw new Error('RPC error');
    const data = await res.json();
    return data.result || [];
  } catch (e) {
    console.warn('Account fetch failed', e);
    return [];
  }
}

export async function validateHiveAccount(name) {
  if (!name) return { valid: false, reason: 'Empty' };
  // Basic pattern: 3-16 chars, lowercase letters, digits, hyphens, one dot segments allowed
  if (!/^[a-z0-9][a-z0-9\-\.]{2,15}$/.test(name)) return { valid: false, reason: 'Format' };
  const accounts = await fetchAccounts([name]);
  if (accounts.length === 0) return { valid: false, reason: 'Not found' };
  return { valid: true, account: accounts[0] };
}

export function usdToHbd(amountUsd) {
  // 1 USD = 1 HBD (simplified for commerce)
  return amountUsd;
}
