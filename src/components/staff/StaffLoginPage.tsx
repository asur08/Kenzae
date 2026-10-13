import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { KENZAE_STORE_CONFIG } from '../../data/storeConfig';

interface StaffLoginPageProps {
  onReturnToStore: () => void;
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({ onReturnToStore }) => {
  const { login, failedAttempts } = useStaffAuth();
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = login(passcode, rememberMe);
    if (!result.success) {
      setErrorMsg(result.error || 'Authentication failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-12">
      {/* Return link */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={onReturnToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-obsidian-slate hover:text-obsidian transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Boutique Catalog</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-canvas-border overflow-hidden">
        {/* Brand Header */}
        <div className="bg-emerald-950 text-white p-6 sm:p-8 text-center border-b border-brass/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-900 border border-brass/40 text-brass-light mb-3">
            <Lock className="w-5 h-5 text-brass" />
          </div>
          <h1 className="font-serif text-2xl font-normal tracking-[0.25em] text-brass-light uppercase">
            KENZAE
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/70 font-medium mt-1">
            Mulanthuruthy Boutique • Staff Portal
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-brass/20 text-[11px] text-brass-light/90">
            <ShieldCheck className="w-3.5 h-3.5 text-brass" />
            <span>Authorized Personnel Only</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="staff-passcode"
                className="block text-xs font-bold uppercase tracking-wider text-obsidian-slate mb-2"
              >
                Store Access Passcode
              </label>
              
              <div className="relative">
                <input
                  id="staff-passcode"
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter staff PIN..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl bg-canvas-subtle border border-canvas-border text-obsidian text-sm focus:outline-none focus:border-emerald-850 focus:bg-white transition-all font-mono tracking-wider pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-slate hover:text-obsidian p-1"
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-obsidian-slate select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-emerald-900 rounded border-canvas-border"
                />
                <span>Remember on this boutique device</span>
              </label>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{errorMsg}</p>
                  {failedAttempts >= 3 && (
                    <p className="text-[11px] text-rose-700/80 mt-1">
                      Default store PIN is defined in boutique configuration. Contact store manager for assistance.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-850 text-white font-semibold text-xs tracking-wider uppercase shadow-md transition-all border border-brass/40 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Lock className="w-4 h-4 text-brass" />
              <span>Sign In to Staff Console</span>
            </button>
          </form>

          {/* Boutique Footer Note */}
          <div className="mt-8 pt-6 border-t border-canvas-border text-center text-xs text-obsidian-slate/70 space-y-1">
            <p className="font-medium text-obsidian-slate">
              {KENZAE_STORE_CONFIG.storeName}
            </p>
            <p className="text-[11px]">
              Mulanthuruthy, Ernakulam District, Kerala
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
