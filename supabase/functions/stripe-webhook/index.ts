import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    const findProfile = async (customerId: string) => {
      const { data } = await supabase.from('user_profiles').select('id').eq('stripe_customer_id', customerId).single();
      return data;
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const profile = await findProfile(session.customer);
        if (profile) {
          await supabase.from('user_profiles').update({
            plan: 'shield_founding',
            scans_this_month: 0,
            billing_cycle_start: new Date().toISOString(),
          }).eq('id', profile.id);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const profile = await findProfile(sub.customer);
        if (profile) {
          await supabase.from('user_profiles').update({ plan: 'free', cancel_at: null }).eq('id', profile.id);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const profile = await findProfile(invoice.customer);
        if (profile) {
          await supabase.from('user_profiles').update({ payment_failed: true }).eq('id', profile.id);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const profile = await findProfile(invoice.customer);
        if (profile) {
          await supabase.from('user_profiles').update({ payment_failed: false, scans_this_month: 0 }).eq('id', profile.id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
