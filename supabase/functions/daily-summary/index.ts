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

  try {
    // Verify internal caller via shared secret
    const secret = req.headers.get('x-internal-secret');
    const expectedSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
    if (!expectedSecret || secret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY not configured');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];
    const todayISO = new Date().toISOString().split('T')[0];

    // New signups
    const { count: newSignups } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterdayISO)
      .lt('created_at', todayISO);

    // New paid conversions
    const { count: newPaid } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .neq('plan', 'free')
      .gte('billing_cycle_start', yesterdayISO)
      .lt('billing_cycle_start', todayISO);

    // Total scans
    const { count: totalScans } = await supabase
      .from('scans')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterdayISO)
      .lt('created_at', todayISO);

    // Confirmations
    const { count: confirmations } = await supabase
      .from('confirmations')
      .select('id', { count: 'exact', head: true })
      .gte('confirmed_at', yesterdayISO)
      .lt('confirmed_at', todayISO);

    // Comparisons
    const { data: compData } = await supabase
      .from('comparisons')
      .select('status')
      .gte('created_at', yesterdayISO)
      .lt('created_at', todayISO);

    const cleanCount = (compData || []).filter((c: any) => c.status === 'no_changes').length;
    const changesCount = (compData || []).filter((c: any) => c.status === 'changes').length;

    const confRate = totalScans && totalScans > 0 ? Math.round(((confirmations || 0) / totalScans) * 100) : 0;

    const emailBody = `CarShake Daily Summary — ${yesterdayISO}

📊 Key Metrics:
• New signups: ${newSignups || 0}
• New paid conversions: ${newPaid || 0}
• Total scans: ${totalScans || 0}
• QR confirmation rate: ${confRate}%
• AI comparisons: ${(compData || []).length} (${cleanCount} clean, ${changesCount} changes)

—
CarShake Analytics`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CarShake Analytics <maryan@mail.sipiteno.com>',
        to: ['sales@sipiteno.com'],
        subject: `📊 CarShake Daily — ${newSignups || 0} signups, ${totalScans || 0} scans`,
        text: emailBody,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('daily-summary error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
