/**
 * Kenzae Boutique Multi-Currency Conversion Engine
 * Supports NRI diaspora in UAE (AED), USA (USD), UK (GBP), Europe (EUR), Canada (CAD), Australia (AUD), Singapore (SGD)
 */

export type CurrencyCode = 'INR' | 'AED' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  country: string;
  exchangeRateFromINR: number; // 1 INR in target currency
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    country: 'India',
    exchangeRateFromINR: 1.0,
    decimals: 0,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    country: 'United Arab Emirates',
    exchangeRateFromINR: 0.0438, // 1 AED ≈ ₹22.8
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    country: 'United States',
    exchangeRateFromINR: 0.0119, // 1 USD ≈ ₹84.0
    decimals: 0,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    country: 'United Kingdom',
    exchangeRateFromINR: 0.0094, // 1 GBP ≈ ₹106.4
    decimals: 0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    country: 'European Union',
    exchangeRateFromINR: 0.0112, // 1 EUR ≈ ₹89.2
    decimals: 0,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    country: 'Canada',
    exchangeRateFromINR: 0.0165, // 1 CAD ≈ ₹60.6
    decimals: 0,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    country: 'Australia',
    exchangeRateFromINR: 0.0182, // 1 AUD ≈ ₹54.9
    decimals: 0,
  },
  SGD: {
    code: 'SGD',
    symbol: 'SG$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    country: 'Singapore',
    exchangeRateFromINR: 0.0158, // 1 SGD ≈ ₹63.3
    decimals: 0,
  },
};

const CACHE_KEY_RATES = 'kenzae_exchange_rates_v1';
const CACHE_KEY_TIMESTAMP = 'kenzae_exchange_timestamp_v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let runtimeRates: Record<CurrencyCode, number> = Object.keys(SUPPORTED_CURRENCIES).reduce(
  (acc, code) => {
    acc[code as CurrencyCode] = SUPPORTED_CURRENCIES[code as CurrencyCode].exchangeRateFromINR;
    return acc;
  },
  {} as Record<CurrencyCode, number>
);

/**
 * Initializes exchange rates from local cache or remote API
 */
export async function refreshExchangeRates(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const cached = localStorage.getItem(CACHE_KEY_RATES);
    const timestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);

    if (cached && timestamp && Date.now() - Number(timestamp) < ONE_DAY_MS) {
      const parsed = JSON.parse(cached);
      Object.assign(runtimeRates, parsed);
      return;
    }

    // Try fetching latest INR rates from open exchange API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://open.er-api.com/v6/latest/INR', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        const fresh: Partial<Record<CurrencyCode, number>> = {};
        for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
          if (data.rates[code]) {
            fresh[code] = data.rates[code];
            runtimeRates[code] = data.rates[code];
          }
        }
        localStorage.setItem(CACHE_KEY_RATES, JSON.stringify(fresh));
        localStorage.setItem(CACHE_KEY_TIMESTAMP, String(Date.now()));
      }
    }
  } catch {
    // Fall back smoothly to calibrated baseline rates
  }
}

/**
 * Converts an INR amount to target currency
 */
export function convertINRTo(amountINR: number, target: CurrencyCode): number {
  if (typeof amountINR !== 'number' || isNaN(amountINR) || amountINR <= 0) return 0;
  if (target === 'INR') return amountINR;
  const rate = runtimeRates[target] || SUPPORTED_CURRENCIES[target].exchangeRateFromINR;
  const converted = amountINR * rate;
  // Luxury retail pricing rounding: round to nearest whole integer for clean display
  return Math.round(converted);
}

/**
 * Formats an INR amount into the target currency with symbol and localized grouping
 */
export function formatLocalizedPrice(amountINR: number, currency: CurrencyCode): string {
  if (typeof amountINR !== 'number' || isNaN(amountINR)) {
    return currency === 'INR' ? '₹0' : `${SUPPORTED_CURRENCIES[currency].symbol} 0`;
  }

  const config = SUPPORTED_CURRENCIES[currency];

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amountINR);
  }

  const converted = convertINRTo(amountINR, currency);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: config.decimals,
  }).format(converted);

  return `${config.symbol} ${formattedNumber}`;
}
