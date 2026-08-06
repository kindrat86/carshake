import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { identifyUser, track } from '@/lib/posthog';

// Cookie-based auth against the Vercel auth functions (api/auth/*).
//
// Previously this used the Lovable broker (/@oauth/initiate), a relative URL
// that only exists on *.lovable.app and 404'd on the standalone Vercel deploy.
// Now: signInWithGoogle redirects to /api/auth/google, which does real Google
// OAuth (PKCE), verifies the Google ID token server-side, mints an httpOnly
// __Host-cs_session cookie, and lands on /auth/callback. We then call
// /api/auth/me to read the session (the cookie is httpOnly, so JS can't see it
// directly — we rely on the backend to tell us who we are).

interface CarShakeUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: CarShakeUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<CarShakeUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CarShakeUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: ask the backend who we are. Called on mount and whenever the
  // browser returns to the app with a fresh cookie (e.g. after /auth/callback).
  const refresh = async () => {
    try {
      const resp = await fetch('/api/auth/me', { credentials: 'include' });
      if (resp.ok) {
        const { user: u } = await resp.json();
        setUser(u);
        identifyUser(u.id, { email: u.email });
        return u;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = () => {
    // Full-page redirect: Google OAuth is cross-origin and needs a real
    // navigation, not a fetch. The callback sets the cookie and lands on
    // /auth/callback, which calls refresh() via AuthCallback.tsx.
    track('auth_started', { method: 'google' });
    window.location.href = '/api/auth/google';
  };

  const signInWithEmail = async (email: string) => {
    // NOTE: magic-link email login is not yet wired to the new backend (Phase 3).
    // The Supabase OTP path is retained temporarily via the bridge so existing
    // email sign-ins keep working; it routes through the Supabase client that
    // supabaseSession.ts hydrates. After Phase 6 this becomes a Vercel OTP fn.
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + '/auth/callback' },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
