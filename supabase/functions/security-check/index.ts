import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface SecurityCheckRequest {
  action: 'check_password' | 'rate_limit' | 'audit_login';
  password?: string;
  operation?: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT from header for authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { action, password, operation, user_id }: SecurityCheckRequest = await req.json();

    switch (action) {
      case 'check_password':
        if (!password) {
          return new Response(
            JSON.stringify({ error: 'Password required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Check password strength
        const passwordChecks = {
          minLength: password.length >= 8,
          hasUppercase: /[A-Z]/.test(password),
          hasLowercase: /[a-z]/.test(password),
          hasNumber: /[0-9]/.test(password),
          hasSpecialChar: /[^A-Za-z0-9]/.test(password),
        };

        const isStrong = Object.values(passwordChecks).every(check => check);
        
        // Check against common passwords (basic implementation)
        const commonPasswords = [
          'password', '123456', '12345678', 'qwerty', 'abc123',
          'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        const isCommon = commonPasswords.includes(password.toLowerCase());

        return new Response(
          JSON.stringify({
            isStrong,
            isCommon,
            checks: passwordChecks,
            message: isStrong && !isCommon ? 'Password is strong' : 'Password does not meet security requirements'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      case 'rate_limit':
        if (!operation || !user_id) {
          return new Response(
            JSON.stringify({ error: 'Operation and user_id required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Check rate limit via database function
        try {
          await supabase.rpc('check_rate_limit', {
            operation_type: operation,
            user_id: user_id
          });

          return new Response(
            JSON.stringify({ allowed: true }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ 
              allowed: false, 
              error: 'Rate limit exceeded' 
            }),
            { 
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

      case 'audit_login':
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'User ID required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Log security audit event
        await supabase.rpc('audit_security_event', {
          event_type: 'user_login',
          user_id: user_id,
          details: {
            timestamp: new Date().toISOString(),
            user_agent: req.headers.get('user-agent') || 'unknown',
            ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
          }
        });

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

  } catch (error) {
    console.error('Security check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});