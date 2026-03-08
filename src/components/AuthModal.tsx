import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const AuthModal = ({ isOpen, onClose, message }: AuthModalProps) => {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signInWithEmail(email);
    if (!result.error) setEmailSent(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[440px] bg-white rounded-[16px] shadow-modal p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground min-h-[48px] min-w-[48px] flex items-center justify-center">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-bold text-ink mb-2">CarShake</h2>
          <p className="text-body font-body text-base">
            {message || 'Sign in to protect your car'}
          </p>
        </div>

        {emailSent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📧</div>
            <p className="font-body text-lg text-ink font-semibold mb-2">Check your email</p>
            <p className="text-body text-sm">We sent a magic link to <strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 min-h-[52px] rounded-[12px] border border-border bg-white hover:bg-surface transition font-body font-medium text-ink text-base mb-4"
            >
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-custom text-xs font-body uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full min-h-[52px] rounded-[12px] border border-border bg-white px-4 font-body text-base text-ink placeholder:text-muted-custom focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] rounded-[12px] bg-gold text-white font-body font-semibold text-base hover:bg-gold-dark transition"
              >
                Send magic link
              </button>
            </form>

            <p className="text-center text-muted-custom text-xs mt-4 font-body">
              We never share your data. Cancel anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
