import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface StaffAuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (passcode: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  failedAttempts: number;
  isLoading: boolean;
}

const STORAGE_KEY_TOKEN_SESSION = 'kenzae_staff_token_session';
const STORAGE_KEY_TOKEN_LOCAL = 'kenzae_staff_token_persistent';

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return (
        sessionStorage.getItem(STORAGE_KEY_TOKEN_SESSION) ||
        localStorage.getItem(STORAGE_KEY_TOKEN_LOCAL) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(token));
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Validate session on boot
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token) return;

      // 1. If Supabase configured, check Supabase session
      if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (isMounted) setIsAuthenticated(true);
          return;
        }
      }

      // 2. Validate token against server /api/auth/check-session
      try {
        const res = await fetch('/api/auth/check-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          const body = await res.json();
          if (isMounted) setIsAuthenticated(Boolean(body.valid));
        } else if (res.status === 401) {
          // Token expired or invalid
          if (isMounted) {
            setIsAuthenticated(false);
            setToken(null);
            sessionStorage.removeItem(STORAGE_KEY_TOKEN_SESSION);
            localStorage.removeItem(STORAGE_KEY_TOKEN_LOCAL);
          }
        }
      } catch {
        // Offline or serverless endpoint not running during local vite dev; keep token if format looks valid
        if (token && token.split('.').length === 3) {
          if (isMounted) setIsAuthenticated(true);
        }
      }
    }

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (
    passcode: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    if (!passcode || !passcode.trim()) {
      return { success: false, error: 'Please enter the boutique staff passcode.' };
    }

    setIsLoading(true);

    try {
      // 1. Call secure server endpoint /api/auth/verify-staff
      const response = await fetch('/api/auth/verify-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          setToken(data.token);
          setIsAuthenticated(true);
          setFailedAttempts(0);

          try {
            sessionStorage.setItem(STORAGE_KEY_TOKEN_SESSION, data.token);
            if (rememberMe) {
              localStorage.setItem(STORAGE_KEY_TOKEN_LOCAL, data.token);
            } else {
              localStorage.removeItem(STORAGE_KEY_TOKEN_LOCAL);
            }
          } catch (storageErr) {
            console.error('Storage error storing session token', storageErr);
          }

          setIsLoading(false);
          return { success: true };
        }
      } else if (response.status === 401) {
        setFailedAttempts((prev) => prev + 1);
        setIsLoading(false);
        return {
          success: false,
          error: 'Incorrect staff passcode. Please verify with boutique management.',
        };
      } else {
        throw new Error('API_UNAVAILABLE');
      }
    } catch {
      // Endpoint not running (e.g. pure Vite dev server without Vercel serverless)
      console.warn('[StaffAuth] Server auth endpoint unreachable. Testing dev fallback...');
    }

    // 2. Dev Fallback for local Vite development without Vercel API runner
    if (passcode.trim() === 'kenzae2026') {
      const devToken = `header.${btoa(JSON.stringify({ role: 'boutique_staff', expiresAt: Date.now() + 86400000 }))}.devsig`;
      setToken(devToken);
      setIsAuthenticated(true);
      setFailedAttempts(0);

      try {
        sessionStorage.setItem(STORAGE_KEY_TOKEN_SESSION, devToken);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_TOKEN_LOCAL, devToken);
        }
      } catch (err) {
        console.error(err);
      }

      setIsLoading(false);
      return { success: true };
    }

    setFailedAttempts((prev) => prev + 1);
    setIsLoading(false);
    return {
      success: false,
      error: 'Incorrect staff passcode. Please verify with boutique management.',
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }

    setIsAuthenticated(false);
    setToken(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_TOKEN_SESSION);
      localStorage.removeItem(STORAGE_KEY_TOKEN_LOCAL);
    } catch (e) {
      console.error('Storage error during staff logout', e);
    }
  };

  return (
    <StaffAuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
        failedAttempts,
        isLoading,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = (): StaffAuthContextType => {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};
