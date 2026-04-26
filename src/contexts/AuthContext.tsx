import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// SECURITY: Authorization is based on database roles (user_roles table) and tenant
// membership (moving_company_users / customers). RLS policies are the security boundary.

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
  isAuthorized: boolean; // Derived from isAdmin (database role)
  companyId: string | null;
  /** True for movers who completed signup but haven't finished company onboarding yet. */
  needsMoverOnboarding: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, extras?: SignUpExtras) => Promise<{ error: Error | null; needsEmailConfirm?: boolean }>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMover, setIsMover] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [needsMoverOnboarding, setNeedsMoverOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthorized = isAdmin;

  const loadRoles = async (userId: string, metaRole?: string) => {
    try {
      const [rolesRes, companyRes, customerRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('moving_company_users').select('moving_company_id').eq('user_id', userId).maybeSingle(),
        supabase.from('customers').select('id').eq('user_id', userId).maybeSingle(),
      ]);

      const roles = (rolesRes.data ?? []).map((r: { role: string }) => r.role);
      const hasCompany = !!companyRes.data;
      const hasCustomerRow = !!customerRes.data;

      // Admin ONLY when a real `user_roles` record with role='admin' exists.
      // Never infer admin from metadata, email, or any client-side hint.
      const adminFromDb = roles.includes('admin');

      // Mover signup flag is set in user_metadata at signUp() time.
      // A "pending mover" is a verified mover account that hasn't completed onboarding yet.
      const isPendingMover = metaRole === 'mover' && !hasCompany && !adminFromDb;
      const moverEffective = hasCompany || isPendingMover;

      // Customer is true when there's an explicit customers row OR the user signed up as a customer
      // via metadata. Brand-new movers must NOT be flagged as customers — that's what was sending
      // them to /my-moves. Admins also stay out of the customer bucket.
      const customerFromMetadata = metaRole === 'customer';
      const customerEffective =
        !adminFromDb && !moverEffective && (hasCustomerRow || customerFromMetadata || !metaRole);

      setIsAdmin(adminFromDb);
      setIsMover(moverEffective);
      setCompanyId(companyRes.data?.moving_company_id ?? null);
      setNeedsMoverOnboarding(isPendingMover);
      setIsCustomer(customerEffective);
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const metaRole = (session.user.user_metadata as { role?: string } | null)?.role;
        setTimeout(async () => {
          await loadRoles(session.user.id, metaRole);
          setIsLoading(false);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsMover(false);
        setIsCustomer(false);
        setCompanyId(null);
        setNeedsMoverOnboarding(false);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const metaRole = (session.user.user_metadata as { role?: string } | null)?.role;
        await loadRoles(session.user.id, metaRole);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, extras?: SignUpExtras) => {
    const role = extras?.role ?? 'customer';
    const redirectUrl = `${window.location.origin}/auth`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role,
          full_name: extras?.fullName,
          phone: extras?.phone,
          company_name: extras?.companyName,
        },
      },
    });

    if (error) return { error: error as Error };

    const newUserId = data.user?.id;
    if (!newUserId) return { error: null };

    // With auto-confirm on, signUp returns a session and the user is signed in immediately.
    // If `data.session` is null we have email-confirmation-required; surface that to caller.
    const needsEmailConfirm = !data.session;

    // Create role-specific records (best-effort; will retry on first sign-in if blocked)
    try {
      if (role === 'customer') {
        const [firstName, ...rest] = (extras?.fullName ?? '').trim().split(' ');
        await supabase.from('customers').insert({
          user_id: newUserId,
          email,
          first_name: firstName || null,
          last_name: rest.join(' ') || null,
          phone: extras?.phone || null,
        });
      }
      // Mover company creation happens during onboarding wizard, not here.
    } catch (err) {
      console.warn('Post-signup profile creation deferred:', err);
    }

    // If signed in immediately, refresh local role state so navigation works without a reload.
    if (data.session?.user) {
      await loadRoles(data.session.user.id, role);
    }

    return { error: null, needsEmailConfirm };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsMover(false);
    setIsCustomer(false);
    setCompanyId(null);
    setNeedsMoverOnboarding(false);
  };

  return (
    <AuthContext.Provider value={{
      user, session, isAdmin, isMover, isCustomer, isAuthorized, companyId,
      needsMoverOnboarding, isLoading,
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
