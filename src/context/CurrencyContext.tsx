import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  CurrencyCode,
  CurrencyConfig,
  SUPPORTED_CURRENCIES,
  formatLocalizedPrice,
  convertINRTo,
  refreshExchangeRates,
} from '../services/currencyService';

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  formatPrice: (amountINR: number) => string;
  convertPrice: (amountINR: number) => number;
  supportedCurrencies: CurrencyConfig[];
}

const STORAGE_KEY_CURRENCY = 'kenzae_selected_currency_v1';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (stored && stored in SUPPORTED_CURRENCIES) {
        return stored as CurrencyCode;
      }
    } catch {
      // Ignore
    }
    return 'INR';
  });

  useEffect(() => {
    refreshExchangeRates();
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (code in SUPPORTED_CURRENCIES) {
      setCurrentCurrencyState(code);
      try {
        localStorage.setItem(STORAGE_KEY_CURRENCY, code);
      } catch {
        // Ignore
      }
    }
  }, []);

  const formatPrice = useCallback(
    (amountINR: number) => {
      return formatLocalizedPrice(amountINR, currentCurrency);
    },
    [currentCurrency]
  );

  const convertPrice = useCallback(
    (amountINR: number) => {
      return convertINRTo(amountINR, currentCurrency);
    },
    [currentCurrency]
  );

  const currencyConfig = useMemo(
    () => SUPPORTED_CURRENCIES[currentCurrency],
    [currentCurrency]
  );

  const supportedCurrencies = useMemo(
    () => Object.values(SUPPORTED_CURRENCIES),
    []
  );

  const value = useMemo(
    () => ({
      currentCurrency,
      setCurrency,
      currencyConfig,
      formatPrice,
      convertPrice,
      supportedCurrencies,
    }),
    [currentCurrency, setCurrency, currencyConfig, formatPrice, convertPrice, supportedCurrencies]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
