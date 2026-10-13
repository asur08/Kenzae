import React, { createContext, useContext, useState } from 'react';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';

interface StaffAuthContextType {
  isAuthenticated: boolean;
  login: (passcode: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  failedAttempts: number;
}

const STORAGE_KEY_SESSION = 'kenzae_staff_auth_session';
const STORAGE_KEY_LOCAL = 'kenzae_staff_auth_persistent';

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY_SESSION) === 'true') {
        return true;
      }
      if (localStorage.getItem(STORAGE_KEY_LOCAL) === 'true') {
        return true;
      }
    } catch {
      // Storage access blocked or unavailable
    }
    return false;
  });

  const [failedAttempts, setFailedAttempts] = useState(0);

  const login = (passcode: string, rememberMe = false): { success: boolean; error?: string } => {
    const validPasscode = KENZAE_STORE_CONFIG.staffPasscode || 'kenzae2026';
    
    if (!passcode || !passcode.trim()) {
      return { success: false, error: 'Please enter the boutique staff passcode.' };
    }

    if (passcode.trim() === validPasscode) {
      setIsAuthenticated(true);
      setFailedAttempts(0);
      try {
        sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_LOCAL, 'true');
        } else {
          localStorage.removeItem(STORAGE_KEY_LOCAL);
        }
      } catch (e) {
        console.error('Storage error during staff login', e);
      }
      return { success: true };
    } else {
      setFailedAttempts((prev) => prev + 1);
      return { 
        success: false, 
        error: 'Incorrect staff passcode. Please verify with Mulanthuruthy boutique management.' 
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_LOCAL);
    } catch (e) {
      console.error('Storage error during staff logout', e);
    }
  };

  return (
    <StaffAuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        failedAttempts,
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
