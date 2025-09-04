// Utility functions for OKpay

// Supported currencies
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ARS: { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  COP: { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  GTQ: { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' }
};

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
  // Try Keychain extension API first, fallback to deep link
  if (window.hive_keychain) {
    return { method: 'extension', to, amountHBD, memo };
  }
  // Fallback deep link (may not work in all browsers)
  const amountStr = Number(amountHBD).toFixed(3) + ' HBD';
  const op = encodeURIComponent(JSON.stringify(["transfer", { from: "<FROM>", to, amount: amountStr, memo }]));
  return { method: 'deeplink', url: `keychain://requestBroadcast?operations=${op}` };
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

// Currency conversion functions
export async function fetchExchangeRates() {
  const cacheKey = 'okpay_rates_' + new Date().toDateString();
  
  // Check cache first
  const cached = getCachedRates(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error('Rate fetch failed');
    
    const data = await response.json();
    const rates = data.rates;
    
    // Cache the rates
    setCachedRates(cacheKey, rates);
    return rates;
  } catch (error) {
    console.warn('Currency API failed:', error);
    // Try to use yesterday's cache as fallback
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fallbackKey = 'okpay_rates_' + yesterday.toDateString();
    return getCachedRates(fallbackKey) || null;
  }
}

export function getCachedRates(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Cache read failed:', error);
    return null;
  }
}

export function setCachedRates(cacheKey, rates) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(rates));
  } catch (error) {
    console.warn('Cache write failed:', error);
  }
}

export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (!rates || !amount || fromCurrency === toCurrency) return amount;
  
  // Convert to USD first if needed
  let usdAmount = amount;
  if (fromCurrency !== 'USD') {
    const fromRate = rates[fromCurrency];
    if (!fromRate) return null;
    usdAmount = amount / fromRate;
  }
  
  // Convert from USD to target currency
  if (toCurrency === 'USD') return usdAmount;
  const toRate = rates[toCurrency];
  if (!toRate) return null;
  
  return usdAmount * toRate;
}

export function validateCurrency(currencyCode) {
  return currencyCode && SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
}
