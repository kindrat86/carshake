import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ComparisonResult {
  status: 'no_changes' | 'changes';
  summary: string;
  differences: Array<{
    location: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
  }>;
}

export const useAICompare = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async (beforeBase64: string, afterBase64: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compare-photos', {
        body: { before_image: beforeBase64, after_image: afterBase64 },
      });

      if (fnError) throw new Error(fnError.message);
      setResult(data as ComparisonResult);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { compare, loading, result, error };
};
