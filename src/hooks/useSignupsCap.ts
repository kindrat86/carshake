import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSignupsCap = () => {
  const [data, setData] = useState({ total_signups: 47, founding_cap: 100 });

  useEffect(() => {
    supabase.from('signups_cap').select('*').limit(1).single().then(({ data: row }) => {
      if (row) setData({ total_signups: row.total_signups ?? 47, founding_cap: row.founding_cap ?? 100 });
    });
  }, []);

  return {
    scansCount: data.total_signups,
    spotsLeft: data.founding_cap - data.total_signups,
  };
};
