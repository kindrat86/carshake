import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get next unused keyword
    const { data: kw, error: kwError } = await supabase
      .from('blog_keywords')
      .select('*')
      .eq('used', false)
      .order('created_at')
      .limit(1)
      .single();

    if (kwError || !kw) {
      return new Response(JSON.stringify({ message: 'No keywords remaining' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate via Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: `Write a 2000-2500 word blog post for CarShake (carshake.online) targeting the keyword "${kw.keyword}".

Voice: Maryan, first person, opinionated but helpful. Like writing to a smart friend.
Topic: CarShake is a web app that creates signed, AI-verified vehicle condition records at parking/valet handover. QR code mutual confirmation between car owner and parking attendant.

Structure:
- H2 sections (5-7 total)
- First paragraph: direct answer to the keyword query (for Google featured snippets and AI overviews)
- Include 2-3 specific statistics or data points with "According to CarShake analysis" or "Industry data shows" framing
- Include one comparison table or structured list
- Natural, conversational tone — not corporate

CTA integration:
- At the moment of maximum curiosity (the "aha" moment), embed this CTA: "Your next valet handover could go differently. Try CarShake — free. carshake.online"
- Place one more CTA at the end

Internal links: reference these related topics naturally: valet parking liability, car damage documentation, parking lot safety tips

Respond ONLY in JSON (no markdown fences, no preamble):
{"title":"string","slug":"lowercase-with-hyphens","category":"guides|legal|how-to|comparisons|insights","excerpt":"2 sentences","content":"full markdown content","meta_title":"max 60 chars","meta_description":"max 155 chars","tags":["array"],"intent_tier":"buyer|research|awareness","read_time_minutes":number}`
        }]
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse AI response as JSON');
    
    const post = JSON.parse(jsonMatch[0]);

    // Insert post
    const { data: inserted, error: insertError } = await supabase.from('blog_posts').insert({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      target_keyword: kw.keyword,
      intent_tier: post.intent_tier,
      tags: post.tags,
      read_time_minutes: post.read_time_minutes || 8,
      status: 'published',
      published_at: new Date().toISOString(),
    }).select().single();

    if (insertError) throw insertError;

    // Mark keyword used
    await supabase.from('blog_keywords').update({
      used: true,
      post_id: inserted?.id,
    }).eq('id', kw.id);

    return new Response(JSON.stringify({ success: true, post_id: inserted?.id, keyword: kw.keyword }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-blog-post error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
