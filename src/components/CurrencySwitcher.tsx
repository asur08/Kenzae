import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencyCode } from '../services/currencyService';

interface CurrencySwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  className = '',
}) => {
  const { currentCurrency, setCurrency, currencyConfig, supportedCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-canvas-border bg-white/90 hover:bg-white text-obsidian hover:text-maroon-900 transition-all text-[11px] font-semibold tracking-wider shadow-2xs group"
        aria-label="Select Currency"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currencyConfig.flag}</span>
        <span className="font-sans font-medium text-[11px] text-maroon-950">
          {currencyConfig.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-obsidian-muted group-hover:text-maroon-900 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-56 rounded-xl bg-[#FAF8F5] border border-canvas-border shadow-xl z-50 overflow-hidden py-1.5"
          >
            <div className="px-3 py-1.5 border-b border-canvas-border flex items-center justify-between text-[10px] uppercase tracking-widest text-obsidian-muted font-semibold">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-brass" />
                Select Currency
              </span>
              <span>NRI Global</span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-canvas-border/40">
              {supportedCurrencies.map((curr) => {
                const isSelected = curr.code === currentCurrency;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleSelect(curr.code)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-maroon-900/10 text-maroon-950 font-bold'
                        : 'hover:bg-white/80 text-obsidian'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{curr.flag}</span>
                      <div>
                        <div className="font-medium tracking-wide">
                          {curr.code} <span className="text-[10px] font-normal text-obsidian-muted">({curr.symbol})</span>
                        </div>
                        <div className="text-[10px] text-obsidian-muted truncate max-w-[120px]">
                          {curr.country}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-maroon-900 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-1.5 bg-canvas-subtle/40 border-t border-canvas-border text-[9px] text-obsidian-muted leading-tight">
              Rates updated live. Orders billed in INR equivalent at checkout.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
