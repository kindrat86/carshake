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
    // Require internal secret – this function must only be called by other edge functions
    const internalSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
    const providedSecret = req.headers.get('x-internal-secret');
    if (!internalSecret || providedSecret !== internalSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { to, subject, body, userId, sequenceName, stepNumber } = await req.json();

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check unsubscribe status
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email_preferences')
        .eq('id', userId)
        .single();
      
      const prefs = profile?.email_preferences as any;
      if (prefs && prefs.sequences === false) {
        return new Response(JSON.stringify({ skipped: true, reason: 'unsubscribed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Maryan <maryan@mail.sipiteno.com>',
        to: [to],
        bcc: ['sales@sipiteno.com'],
        reply_to: 'sales@sipiteno.com',
        subject,
        text: body + '\n\n—\nMaryan\nCarShake · carshake.online',
      }),
    });

    const data = await response.json();

    // Log to email_sequence_log
    if (userId && sequenceName) {
      await supabase.from('email_sequence_log').insert({
        user_id: userId,
        sequence_name: sequenceName,
        step_number: stepNumber || 1,
        email_subject: subject,
        resend_id: data?.id,
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-email error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
