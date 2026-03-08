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
    const { dropoff_scan_id, pickup_scan_id } = await req.json();
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch photos for both scans
    const [{ data: dropoffPhotos }, { data: pickupPhotos }] = await Promise.all([
      supabase.from('scan_photos').select('*').eq('scan_id', dropoff_scan_id).order('angle'),
      supabase.from('scan_photos').select('*').eq('scan_id', pickup_scan_id).order('angle'),
    ]);

    if (!dropoffPhotos?.length || !pickupPhotos?.length) {
      throw new Error('Missing photos for comparison');
    }

    const allFindings: any[] = [];
    let overallStatus = 'no_changes';

    // Compare each angle pair (process in batches of 3)
    const pairs = dropoffPhotos.map((dp: any, i: number) => ({
      angle: dp.angle,
      dropoff: dp,
      pickup: pickupPhotos.find((pp: any) => pp.angle === dp.angle) || pickupPhotos[i],
    })).filter((p: any) => p.pickup);

    const processPair = async (pair: any) => {
      // Download both images
      const [dropoffRes, pickupRes] = await Promise.all([
        supabase.storage.from('scan-photos').download(pair.dropoff.storage_path),
        supabase.storage.from('scan-photos').download(pair.pickup.storage_path),
      ]);

      if (dropoffRes.error || pickupRes.error) {
        console.error('Failed to download photos:', dropoffRes.error, pickupRes.error);
        return [];
      }

      // Convert to base64
      const toBase64 = async (blob: Blob) => {
        const arr = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
        return btoa(binary);
      };

      const [beforeB64, afterB64] = await Promise.all([
        toBase64(dropoffRes.data),
        toBase64(pickupRes.data),
      ]);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: beforeB64 } },
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: afterB64 } },
              { type: 'text', text: `You are a vehicle condition inspector for CarShake. Compare Image 1 (BEFORE/drop-off) with Image 2 (AFTER/pickup). Both are the same angle of the same vehicle. Find every visible difference in condition: new scratches, dents, chips, scrapes, dirt, stains, missing parts. Be specific about location and severity. Respond ONLY in JSON: {"status":"CHANGED" or "NO_CHANGES", "differences":[{"location":"specific area","description":"what changed","severity":"minor"|"moderate"|"severe"}]}` }
            ]
          }]
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { status: 'NO_CHANGES', differences: [] };

      return (result.differences || []).map((d: any) => ({
        ...d,
        angle: pair.angle,
        status: result.status,
      }));
    };

    // Process in batches of 3
    for (let i = 0; i < pairs.length; i += 3) {
      const batch = pairs.slice(i, i + 3);
      const results = await Promise.all(batch.map(processPair));
      for (const findings of results) {
        if (findings.length > 0) {
          overallStatus = 'changes';
          allFindings.push(...findings);
        }
      }
    }

    // Create comparison record
    const { data: comp } = await supabase.from('comparisons').insert({
      dropoff_scan_id,
      pickup_scan_id,
      status: overallStatus,
      total_differences: allFindings.length,
      ai_result_json: { findings: allFindings },
    }).select().single();

    // Insert findings
    if (comp && allFindings.length > 0) {
      await supabase.from('comparison_findings').insert(
        allFindings.map((f: any) => ({
          comparison_id: comp.id,
          angle: f.angle,
          location: f.location,
          description: f.description,
          severity: f.severity,
        }))
      );
    }

    // Update scan statuses
    await supabase.from('scans').update({ status: 'completed' }).eq('id', dropoff_scan_id);
    await supabase.from('scans').update({ status: 'completed' }).eq('id', pickup_scan_id);

    return new Response(JSON.stringify({
      comparison_id: comp?.id,
      status: overallStatus,
      total_differences: allFindings.length,
      findings: allFindings,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
