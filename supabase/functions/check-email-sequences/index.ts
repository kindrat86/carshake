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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const results: string[] = [];

    // Helper: send email via send-email function
    const sendEmail = async (to: string, subject: string, body: string, userId: string, sequenceName: string, stepNumber: number) => {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ to, subject, body, userId, sequenceName, stepNumber }),
      });
      return response.json();
    };

    // Helper: check if email already sent
    const alreadySent = async (userId: string, sequenceName: string, stepNumber: number) => {
      const { data } = await supabase
        .from('email_sequence_log')
        .select('id')
        .eq('user_id', userId)
        .eq('sequence_name', sequenceName)
        .eq('step_number', stepNumber)
        .limit(1);
      return (data?.length ?? 0) > 0;
    };

    // --- SEQUENCE 2: Abandoned Funnel ---
    // Users who signed up but no scan within 24h
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, email, created_at');

    for (const profile of (profiles || [])) {
      if (!profile.email) continue;

      // Check if user has any scans
      const { data: userScans } = await supabase
        .from('scans')
        .select('id')
        .eq('user_id', profile.id)
        .limit(1);

      const hasScans = (userScans?.length ?? 0) > 0;

      if (!hasScans && profile.created_at) {
        const createdAt = new Date(profile.created_at);
        const daysSinceSignup = (now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000);

        const scanUrl = `https://carshake.online/scan/new`;

        if (daysSinceSignup >= 1 && daysSinceSignup < 2) {
          if (!(await alreadySent(profile.id, 'abandoned', 1))) {
            await sendEmail(profile.email, "Your car's protection is waiting", `You signed up for CarShake but haven't scanned yet. It takes 60 seconds — open ${scanUrl} next time you park.\n\nHere's what you'll see: 8 guided angles, QR handover, AI comparison.`, profile.id, 'abandoned', 1);
            results.push(`abandoned-1: ${profile.email}`);
          }
        } else if (daysSinceSignup >= 3 && daysSinceSignup < 4) {
          if (!(await alreadySent(profile.id, 'abandoned', 2))) {
            await sendEmail(profile.email, "What a real CarShake scan looks like", `Last week a user at JFK airport found a door ding after 5 days of parking. Their CarShake comparison proved it happened during parking. The garage paid $2,100.\n\nThat started with a 60-second scan. Try yours: ${scanUrl}`, profile.id, 'abandoned', 2);
            results.push(`abandoned-2: ${profile.email}`);
          }
        } else if (daysSinceSignup >= 5 && daysSinceSignup < 6) {
          if (!(await alreadySent(profile.id, 'abandoned', 3))) {
            await sendEmail(profile.email, "3 free scans. Zero reason not to try.", `No credit card. No commitment. No catch.\n\nJust open carshake.online on your phone next time you're at a valet, airport, or body shop.\n\n60 seconds. Real protection.\n\n${scanUrl}`, profile.id, 'abandoned', 3);
            results.push(`abandoned-3: ${profile.email}`);
          }
        } else if (daysSinceSignup >= 7 && daysSinceSignup < 8) {
          if (!(await alreadySent(profile.id, 'abandoned', 4))) {
            await sendEmail(profile.email, "Last reminder — your free scans don't expire", `Your CarShake account is set up and waiting. Your free 3 scans/month are there whenever you need them.\n\nFounding pricing ($2.97/mo for unlimited) won't last forever — but your free tier will.\n\nSee you at your next handover.\n\n${scanUrl}`, profile.id, 'abandoned', 4);
            results.push(`abandoned-4: ${profile.email}`);
          }
        }
      }
    }

    // --- SEQUENCE 3: Win-back ---
    const { data: cancelledProfiles } = await supabase
      .from('user_profiles')
      .select('id, email, cancel_at')
      .eq('plan', 'free')
      .not('cancel_at', 'is', null);

    for (const profile of (cancelledProfiles || [])) {
      if (!profile.email || !profile.cancel_at) continue;
      const cancelDate = new Date(profile.cancel_at);
      const daysSinceCancel = (now.getTime() - cancelDate.getTime()) / (24 * 60 * 60 * 1000);

      const dashboardUrl = 'https://carshake.online/dashboard';
      const reactivateUrl = 'https://carshake.online/dashboard?upgrade=true';

      // Get scan count
      const { count } = await supabase.from('scans').select('id', { count: 'exact', head: true }).eq('user_id', profile.id);

      if (daysSinceCancel >= 0 && daysSinceCancel < 1) {
        if (!(await alreadySent(profile.id, 'winback', 1))) {
          await sendEmail(profile.email, "We saved your scans", `Your CarShake subscription is cancelled. But your scan history (${count || 0} scans) is saved. That evidence chain doesn't disappear.\n\nYou can still view everything on the free plan.\n\nIf you change your mind, Shield+ is one click: ${reactivateUrl}`, profile.id, 'winback', 1);
          results.push(`winback-1: ${profile.email}`);
        }
      } else if (daysSinceCancel >= 3 && daysSinceCancel < 4) {
        if (!(await alreadySent(profile.id, 'winback', 2))) {
          await sendEmail(profile.email, "CarShake users caught damage this month", `Since you left, users have been completing scans and catching damage they would have missed.\n\nWithout CarShake, they'd have paid out of pocket.\n\nYour scan history is still here: ${dashboardUrl}`, profile.id, 'winback', 2);
          results.push(`winback-2: ${profile.email}`);
        }
      } else if (daysSinceCancel >= 7 && daysSinceCancel < 8) {
        if (!(await alreadySent(profile.id, 'winback', 3))) {
          await sendEmail(profile.email, "One click to reactivate", `Everything is still here. Your scans. Your locations. Your evidence chain.\n\nOne click to reactivate Shield+: ${reactivateUrl} — same founding price, same guarantee, same protection.`, profile.id, 'winback', 3);
          results.push(`winback-3: ${profile.email}`);
        }
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('check-email-sequences error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
