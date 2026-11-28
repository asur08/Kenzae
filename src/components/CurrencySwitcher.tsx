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
        className="flex items-center gap-1.5 px-3 h-10 sm:h-9 rounded-[8px] border border-canvas-border bg-white hover:bg-canvas-subtle text-obsidian active:scale-[0.98] transition-[transform,background-color] duration-150 text-[13px] font-medium tabular-nums"
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-obsidian-muted" strokeWidth={1.5} />
        <span className="text-obsidian">{currencyConfig.code}</span>
        <ChevronDown
          className={`w-4 h-4 text-obsidian-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.5}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 mt-2 w-60 rounded-[12px] bg-white border border-canvas-border shadow-editorial z-50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-canvas-border flex items-center justify-between text-xs text-obsidian-muted font-medium">
              <span>Currency</span>
              <span>Billed in INR</span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-canvas-border">
              {supportedCurrencies.map((curr) => {
                const isSelected = curr.code === currentCurrency;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleSelect(curr.code)}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-[13px] transition-colors duration-150 ${
                      isSelected
                        ? 'bg-canvas-subtle text-maroon-950 font-medium'
                        : 'hover:bg-canvas text-obsidian'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium tabular-nums w-9 shrink-0">
                        {curr.code}
                      </span>
                      <span className="text-obsidian-slate truncate">
                        {curr.country}
                      </span>
                    </div>
                    <span className="text-xs text-obsidian-muted tabular-nums shrink-0">
                      {curr.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
