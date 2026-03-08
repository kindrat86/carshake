import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check Supabase DB
    const dbStart = Date.now();
    try {
      const { error } = await supabase.from('signups_cap').select('id').limit(1);
      checks.database = { ok: !error, ms: Date.now() - dbStart, error: error?.message };
    } catch (e) {
      checks.database = { ok: false, ms: Date.now() - dbStart, error: e.message };
    }

    // Check Storage
    const storageStart = Date.now();
    try {
      const { error } = await supabase.storage.from('scan-photos').list('', { limit: 1 });
      checks.storage = { ok: !error, ms: Date.now() - storageStart, error: error?.message };
    } catch (e) {
      checks.storage = { ok: false, ms: Date.now() - storageStart, error: e.message };
    }

    // Check Claude API (lightweight)
    const aiStart = Date.now();
    try {
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!apiKey) {
        checks.ai = { ok: false, error: 'ANTHROPIC_API_KEY not set' };
      } else {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Reply with "ok"' }],
          }),
        });
        checks.ai = { ok: response.ok, ms: Date.now() - aiStart };
      }
    } catch (e) {
      checks.ai = { ok: false, ms: Date.now() - aiStart, error: e.message };
    }

    const allOk = Object.values(checks).every((c) => c.ok);

    // Alert if any check failed
    if (!allOk) {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (resendKey) {
        const failedChecks = Object.entries(checks).filter(([, c]) => !c.ok).map(([k, c]) => `${k}: ${c.error}`).join('\n');
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'CarShake Health <maryan@mail.sipiteno.com>',
            to: ['sales@sipiteno.com'],
            subject: '🚨 CarShake Health Check Failed',
            text: `Health check failed at ${new Date().toISOString()}\n\n${failedChecks}`,
          }),
        });
      }
    }

    return new Response(JSON.stringify({ status: allOk ? 'healthy' : 'degraded', checks }), {
      status: allOk ? 200 : 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
