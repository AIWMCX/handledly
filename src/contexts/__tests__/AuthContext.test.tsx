import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

/**
 * E2E-style flow tests for customer + mover signup / login.
 * We mock the Supabase client so we can drive the AuthProvider through realistic
 * scenarios and verify:
 *   - the correct rows would be inserted (customers / moving_company_users)
 *   - the AuthContext exposes the right role flags after each flow
 *   - the implied post-auth redirect target is correct
 */

type Listener = (event: string, session: unknown) => void;

const insertSpies: Record<string, ReturnType<typeof vi.fn>> = {};
let authListener: Listener | null = null;
let currentSession: { user: { id: string; email: string; user_metadata: Record<string, unknown> } } | null = null;
let userRolesRows: Array<{ role: string }> = [];
let movingCompanyUsersRow: { moving_company_id: string } | null = null;
let customersRow: { id: string } | null = null;

function makeSelectChain(rows: unknown, single = false) {
  const result = single
    ? { data: rows, error: null }
    : { data: Array.isArray(rows) ? rows : rows ? [rows] : [], error: null };
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: () => Promise.resolve(result),
    then: (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

vi.mock('@/integrations/supabase/client', () => {
  const fromImpl = (table: string) => {
    insertSpies[table] = insertSpies[table] ?? vi.fn(() => Promise.resolve({ data: null, error: null }));
    if (table === 'user_roles') return makeSelectChain(userRolesRows);
    if (table === 'moving_company_users') {
      const chain = makeSelectChain(movingCompanyUsersRow, true);
      (chain as { insert: typeof insertSpies[string] }).insert = insertSpies[table];
      return chain;
    }
    if (table === 'customers') {
      const chain = makeSelectChain(customersRow, true);
      (chain as { insert: typeof insertSpies[string] }).insert = insertSpies[table];
      return chain;
    }
    return makeSelectChain(null, true);
  };

  return {
    supabase: {
      from: (table: string) => fromImpl(table),
      auth: {
        onAuthStateChange: (cb: Listener) => {
          authListener = cb;
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getSession: () => Promise.resolve({ data: { session: currentSession } }),
        signInWithPassword: vi.fn(async ({ email }: { email: string }) => {
          currentSession = currentSession ?? {
            user: { id: 'u-login', email, user_metadata: { role: 'customer' } },
          };
          authListener?.('SIGNED_IN', currentSession);
          return { error: null };
        }),
        signUp: vi.fn(async ({ email, options }: { email: string; options?: { data?: Record<string, unknown> } }) => {
          const role = (options?.data?.role as string) ?? 'customer';
          const id = `u-${role}-new`;
          const session = {
            user: { id, email, user_metadata: { role, ...(options?.data ?? {}) } },
          };
          currentSession = session;
          authListener?.('SIGNED_IN', session);
          return { data: { user: session.user, session }, error: null };
        }),
        signOut: vi.fn(async () => {
          currentSession = null;
          authListener?.('SIGNED_OUT', null);
          return { error: null };
        }),
      },
    },
  };
});

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function resolveRedirect(s: ReturnType<typeof useAuth>) {
  if (s.isAdmin) return '/admin';
  if (s.isMover) return s.needsMoverOnboarding ? '/mover/onboarding' : '/mover/dashboard';
  if (s.isCustomer) return '/my-moves';
  return '/';
}

function Probe({ onState }: { onState: (s: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth();
  React.useEffect(() => {
    onState(auth);
  });
  if (auth.isLoading) return <span>loading</span>;
  return <span data-testid="redirect">{resolveRedirect(auth)}</span>;
}

function renderAuth(onState: (s: ReturnType<typeof useAuth>) => void) {
  return render(
    <AuthProvider>
      <Probe onState={onState} />
    </AuthProvider>,
  );
}

beforeEach(() => {
  authListener = null;
  currentSession = null;
  userRolesRows = [];
  movingCompanyUsersRow = null;
  customersRow = null;
  for (const k of Object.keys(insertSpies)) delete insertSpies[k];
});

describe('Auth flow — customer signup', () => {
  it('creates a customers row and lands on /my-moves', async () => {
    let last: ReturnType<typeof useAuth> | null = null;
    renderAuth((s) => (last = s));
    await waitFor(() => expect(last?.isLoading).toBe(false));

    await act(async () => {
      const res = await last!.signUp('jane@example.com', 'pw123456', {
        role: 'customer',
        fullName: 'Jane Doe',
        phone: '5551234567',
      });
      expect(res.error).toBeNull();
    });

    await waitFor(() => expect(last?.user?.email).toBe('jane@example.com'));
    expect(insertSpies['customers']).toHaveBeenCalledTimes(1);
    expect(insertSpies['moving_company_users']).toBeUndefined();

    await waitFor(() => expect(last?.isCustomer).toBe(true));
    expect(last?.isMover).toBe(false);
    expect(last?.isAdmin).toBe(false);
    expect(screen.getByTestId('redirect').textContent).toBe('/my-moves');
  });
});

describe('Auth flow — mover signup', () => {
  it('flags the user as a pending mover and redirects to /mover/onboarding', async () => {
    let last: ReturnType<typeof useAuth> | null = null;
    renderAuth((s) => (last = s));
    await waitFor(() => expect(last?.isLoading).toBe(false));

    await act(async () => {
      const res = await last!.signUp('ops@acme-moving.com', 'pw123456', {
        role: 'mover',
        fullName: 'Sam Mover',
        phone: '5557654321',
        companyName: 'Acme Moving Co.',
      });
      expect(res.error).toBeNull();
    });

    // Mover signup MUST NOT auto-create a customers row, and the moving_company_users
    // row is created later by the onboarding wizard, not at signup.
    expect(insertSpies['customers']).toBeUndefined();

    await waitFor(() => {
      expect(last?.isMover).toBe(true);
      expect(last?.needsMoverOnboarding).toBe(true);
    });
    expect(last?.isCustomer).toBe(false);
    expect(last?.isAdmin).toBe(false);
    expect(screen.getByTestId('redirect').textContent).toBe('/mover/onboarding');
  });

  it('routes a fully onboarded mover to /mover/dashboard', async () => {
    movingCompanyUsersRow = { moving_company_id: 'co-123' };
    currentSession = {
      user: { id: 'u-mover-active', email: 'sam@acme.com', user_metadata: { role: 'mover' } },
    };

    let last: ReturnType<typeof useAuth> | null = null;
    renderAuth((s) => (last = s));

    await waitFor(() => {
      expect(last?.isLoading).toBe(false);
      expect(last?.isMover).toBe(true);
      expect(last?.needsMoverOnboarding).toBe(false);
    });
    expect(last?.companyId).toBe('co-123');
    expect(last?.isCustomer).toBe(false);
    expect(screen.getByTestId('redirect').textContent).toBe('/mover/dashboard');
  });
});

describe('Auth flow — login redirects', () => {
  it('logs an existing customer in and lands on /my-moves', async () => {
    customersRow = { id: 'cust-1' };
    currentSession = {
      user: { id: 'u-cust-existing', email: 'jane@example.com', user_metadata: { role: 'customer' } },
    };

    let last: ReturnType<typeof useAuth> | null = null;
    renderAuth((s) => (last = s));

    await waitFor(() => {
      expect(last?.isLoading).toBe(false);
      expect(last?.isCustomer).toBe(true);
    });
    expect(last?.isMover).toBe(false);
    expect(last?.isAdmin).toBe(false);
    expect(screen.getByTestId('redirect').textContent).toBe('/my-moves');
  });

  it('does NOT promote a regular user to admin when no admin row exists', async () => {
    currentSession = {
      user: { id: 'u-no-admin', email: 'someone@example.com', user_metadata: { role: 'customer' } },
    };
    userRolesRows = []; // no admin row in user_roles

    let last: ReturnType<typeof useAuth> | null = null;
    renderAuth((s) => (last = s));

    await waitFor(() => expect(last?.isLoading).toBe(false));
    expect(last?.isAdmin).toBe(false);
    expect(last?.isAuthorized).toBe(false);
  });

  it('grants admin only when the user_roles record actually has role=admin', async () => {
    currentSession = {
      user: { id: 'u-admin', email: 'boss@example.com', user_metadata: {} },
    };
    userRolesRows = [{ role: 'admin' }];

    let last: ReturnType<typeof useAuth> | null = null;
    renderAuth((s) => (last = s));

    await waitFor(() => {
      expect(last?.isLoading).toBe(false);
      expect(last?.isAdmin).toBe(true);
    });
    expect(screen.getByTestId('redirect').textContent).toBe('/admin');
  });
});