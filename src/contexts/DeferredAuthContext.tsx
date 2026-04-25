import React, { lazy, Suspense, createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Lightweight auth context that defers loading the full Supabase auth
 * until after initial render, reducing main bundle JS and improving FCP.
 */

export type AccountRole = 'customer' | 'mover';

interface SignUpExtras {
  role: AccountRole;
  fullName?: string;
  phone?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isMover: boolean;
  isCustomer: boolean;
  isAuthorized: boolean;
  companyId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, extras?: SignUpExtras) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Lazy load the real AuthProvider to defer Supabase client import
const RealAuthProvider = lazy(() => 
  import('@/contexts/AuthContext').then(m => ({ 
    default: m.AuthProvider 
  }))
);

/**
 * Wraps the real AuthProvider in a Suspense boundary.
 * During initial load, provides a lightweight fallback that renders children
 * immediately (no auth needed for most public pages).
 */
export function DeferredAuthProvider({ children }: { children: React.ReactNode }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Load auth provider after first paint
    const id = requestAnimationFrame(() => {
      setShouldLoad(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const noopValue: AuthContextType = {
    user: null,
    session: null,
    isAdmin: false,
    isMover: false,
    isCustomer: false,
    isAuthorized: false,
    companyId: null,
    isLoading: true,
    signIn: async () => ({ error: new Error('Auth not loaded yet') }),
    signUp: async () => ({ error: new Error('Auth not loaded yet') }),
    signOut: async () => {},
  };

  if (!shouldLoad) {
    return (
      <AuthContext.Provider value={noopValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <Suspense fallback={
      <AuthContext.Provider value={noopValue}>
        {children}
      </AuthContext.Provider>
    }>
      <RealAuthProvider>
        {children}
      </RealAuthProvider>
    </Suspense>
  );
}
