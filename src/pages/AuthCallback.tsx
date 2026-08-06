import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// OAuth landing page.
//
// The Vercel google-callback function has already: verified the Google ID token,
// upserted the user on the Mac mini, and set the __Host-cs_session cookie. It
// 302s here. Our job is to (1) read the session via /api/auth/me so the rest of
// the app knows who's logged in, (2) apply any pending referral, (3) route to
// the dashboard (or a scan the user was mid-flow on).
//
// On error (?error=... from google-callback's fail() path) we show the message.

const AuthCallback = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get('error');
    if (urlError) {
      setError(urlError);
      return;
    }

    const finish = async () => {
      const user = await refresh();
      if (!user) {
        // No session — the cookie didn't land or verification failed upstream.
        navigate('/', { replace: true });
        return;
      }

      // Apply a pending referral, if any. The referrer's code was captured on
      // the landing page (Index.tsx) before the user clicked sign-in.
      const referralCode = localStorage.getItem('carshake_referral');
      if (referralCode) {
        localStorage.removeItem('carshake_referral');
        try {
          await fetch('/api/referrals/apply', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode }),
          });
          // Phase 3 will implement /api/referrals/apply against the Mac mini.
          // Until then this is a best-effort fire-and-forget; it must not block
          // the user from reaching the dashboard.
        } catch {
          /* referral attribution is non-blocking */
        }
      }

      const pendingScan = localStorage.getItem('carshake_pending_scan');
      if (pendingScan) {
        localStorage.removeItem('carshake_pending_scan');
        navigate(`/dashboard/scan/${pendingScan}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    };

    finish();
  }, [navigate, refresh]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="text-center max-w-md px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="font-body text-lg text-ink font-semibold mb-2">Sign-in didn't complete</p>
          <p className="text-body text-sm mb-6">
            {error === 'email_not_verified'
              ? 'Google says your email is not verified. Try another account.'
              : 'Something went wrong during Google sign-in. Please try again.'}
          </p>
          <a href="/" className="text-gold underline hover:text-gold-dark font-body">
            Back to CarShake
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4" />
        <p className="font-body text-body">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
