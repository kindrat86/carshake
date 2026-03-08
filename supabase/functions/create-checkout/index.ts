import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { plan, userId } = await req.json();
    const { data: profile } = await supabase.from('user_profiles').select('stripe_customer_id, email').eq('id', userId).single();
    if (!profile) throw new Error('Profile not found');

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: profile.email, metadata: { userId } });
      customerId = customer.id;
      await supabase.from('user_profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    // Create or find price
    const priceMap: Record<string, { amount: number; name: string }> = {
      shield: { amount: 297, name: 'Shield+ Founding' },
      pro: { amount: 1997, name: 'Pro' },
    };
    const planInfo = priceMap[plan] || priceMap.shield;

    // Search for existing price
    const prices = await stripe.prices.list({ lookup_keys: [plan], limit: 1 });
    let priceId: string;

    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      const product = await stripe.products.create({ name: planInfo.name });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: planInfo.amount,
        currency: 'usd',
        recurring: { interval: 'month' },
        lookup_key: plan,
      });
      priceId = price.id;
    }

    const origin = req.headers.get('origin') || 'https://carshake.online';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
