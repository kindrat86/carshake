import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const pendingScan = localStorage.getItem('carshake_pending_scan');
        if (pendingScan) {
          localStorage.removeItem('carshake_pending_scan');
          navigate(`/dashboard/scan/${pendingScan}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/');
      }
    };

    // Small delay to let auth state settle
    setTimeout(handleCallback, 500);
  }, [navigate]);

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
