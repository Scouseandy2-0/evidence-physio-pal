// Deno Edge Function: clone-protocol
// Clones an existing treatment protocol for the authenticated user

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceKey || !anonKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { protocolId } = await req.json();
    if (!protocolId) {
      return new Response(JSON.stringify({ error: 'protocolId is required' }), { status: 400 });
    }

    // Client to read auth user from the incoming JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401 });
    }

    const userId = userData.user.id;

    // Admin client for DB operations
    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch the source template
    const { data: template, error: tplErr } = await admin
      .from('treatment_protocols')
      .select('*')
      .eq('id', protocolId)
      .maybeSingle();

    if (tplErr) {
      console.error('Template fetch error:', tplErr);
      return new Response(JSON.stringify({ error: 'Failed to load template' }), { status: 500 });
    }

    if (!template) {
      return new Response(JSON.stringify({ error: 'Template not found' }), { status: 404 });
    }

    // Insert clone for this user (bypass RLS with service role but enforce ownership explicitly)
    const clonePayload = {
      name: `${template.name} (Copy)`,
      description: template.description,
      duration_weeks: template.duration_weeks,
      frequency_per_week: template.frequency_per_week,
      condition_id: template.condition_id ?? null,
      protocol_steps: template.protocol_steps ?? null,
      evidence_ids: template.evidence_ids ?? null,
      contraindications: template.contraindications ?? null,
      precautions: template.precautions ?? null,
      expected_outcomes: template.expected_outcomes ?? null,
      created_by: userId,
      is_validated: false,
    };

    const { data: inserted, error: insErr } = await admin
      .from('treatment_protocols')
      .insert(clonePayload)
      .select()
      .single();

    if (insErr) {
      console.error('Clone insert error:', insErr);
      return new Response(JSON.stringify({ error: 'Failed to clone protocol' }), { status: 500 });
    }

    return new Response(JSON.stringify({ protocol: inserted }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Unhandled error in clone-protocol:', e);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), { status: 500 });
  }
});
