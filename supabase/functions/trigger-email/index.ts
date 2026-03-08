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
    const { userId, eventType, eventData } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, email_preferences, plan, scans_this_month')
      .eq('id', userId)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prefs = profile.email_preferences as any;
    if (prefs && prefs.sequences === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'unsubscribed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sendEmail = async (to: string, subject: string, body: string, sequenceName: string, stepNumber: number) => {
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'x-internal-secret': Deno.env.get('INTERNAL_FUNCTION_SECRET') || '',
        },
        body: JSON.stringify({ to, subject, body, userId, sequenceName, stepNumber }),
      });
    };

    // Check if already sent
    const alreadySent = async (sequenceName: string, stepNumber: number) => {
      const { data } = await supabase
        .from('email_sequence_log')
        .select('id')
        .eq('user_id', userId)
        .eq('sequence_name', sequenceName)
        .eq('step_number', stepNumber)
        .limit(1);
      return (data?.length ?? 0) > 0;
    };

    const dashboardUrl = 'https://carshake.online/dashboard';
    const upgradeUrl = 'https://carshake.online/dashboard?upgrade=true';

    switch (eventType) {
      case 'first_scan_completed': {
        if (await alreadySent('soap', 1)) break;
        await sendEmail(profile.email, 'Your CarShake scan is ready',
          `Hey — your first CarShake scan is saved.\n\nHere's your dashboard: ${dashboardUrl}\n\nI built CarShake after a hotel valet in Athens handed me back my car with a scratch on the bumper. The manager pointed at the ticket: "We are not responsible."\n\nI had no photos from before. Nothing. I paid €800 for a scratch I didn't cause.\n\nThat's why CarShake exists. Both sides sign. Both sides are protected.\n\nQuick tip: next time you hand over your keys, scan BEFORE they take the car. The QR confirmation is what makes the evidence airtight.\n\nTomorrow I'll tell you the one thing nobody in the parking industry talks about.`,
          'soap', 1);
        break;
      }
      case 'scan_limit_warning': {
        if (await alreadySent('seinfeld_limit', 1)) break;
        await sendEmail(profile.email, '1 free scan left this month',
          `You've used 2 of your 3 free scans. Make the last one count — or unlock unlimited for $2.97/mo: ${upgradeUrl}`,
          'seinfeld_limit', 1);
        break;
      }
      case 'first_comparison': {
        if (await alreadySent('seinfeld_comparison', 1)) break;
        await sendEmail(profile.email, 'Your first comparison is in ✅',
          `You now have documented, AI-verified proof of your car's condition across two time points. Next time someone says 'it was already there,' you have the answer.\n\nKeep scanning: ${dashboardUrl}`,
          'seinfeld_comparison', 1);
        break;
      }
      case 'payment_failed': {
        if (await alreadySent('seinfeld_payment', 1)) break;
        await sendEmail(profile.email, "Your CarShake payment didn't go through",
          `Your Shield+ payment failed. Update your card to keep unlimited scans and evidence reports: ${dashboardUrl}\n\nYou have 7 days before your plan downgrades to free. Your scan history stays either way.`,
          'seinfeld_payment', 1);
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('trigger-email error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
