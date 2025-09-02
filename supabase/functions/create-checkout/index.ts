import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Create checkout function started");
    
    // Debug: List all environment variables that start with STRIPE
    console.log("Environment debug - All env vars:", Object.keys(Deno.env.toObject()).filter(key => key.includes('STRIPE')));
    
    // Check required environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log("Environment check:", {
      hasStripeKey: !!stripeKey,
      stripeKeyPrefix: stripeKey?.substring(0, 10) || 'undefined',
      stripeKeyLength: stripeKey?.length || 0,
      hasSupabaseUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey
    });
    
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY environment variable is not set");
      return new Response(JSON.stringify({ 
        error: "Payment service temporarily unavailable. Please try again later or contact support.",
        code: "STRIPE_CONFIG_ERROR"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      });
    }
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables are not set");
      return new Response(JSON.stringify({ 
        error: "Database configuration error - please contact support",
        code: "DB_CONFIG_ERROR"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      });
    }
    
    console.log("Environment variables verified");

    // Create a Supabase client using the anon key
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Authenticating user");
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      console.error("Authentication error:", authError);
      throw new Error("Authentication failed");
    }
    
    const user = data.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    console.log("User authenticated:", user.email);

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16" 
    });
    
    console.log("Stripe client initialized");
    
    console.log("Looking up existing customer for:", user.email);
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found");
    }

    console.log("Creating checkout session");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: "PhysioEvidence Premium",
              description: "Full access to all evidence-based physiotherapy resources"
            },
            unit_amount: 399, // £3.99 in pence
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success`,
      cancel_url: `${req.headers.get("origin")}/`,
    });
    
    console.log("Checkout session created successfully:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide user-friendly error messages
    let userMessage = "An unexpected error occurred. Please try again.";
    let statusCode = 500;
    
    if (errorMessage.includes("Authentication")) {
      userMessage = "Please sign in again to continue with payment.";
      statusCode = 401;
    } else if (errorMessage.includes("Stripe")) {
      userMessage = "Payment service is temporarily unavailable. Please try again in a few minutes.";
      statusCode = 503;
    } else if (errorMessage.includes("customer")) {
      userMessage = "Unable to process payment. Please contact support if this continues.";
    }
    
    return new Response(JSON.stringify({ 
      error: userMessage,
      code: "CHECKOUT_ERROR",
      details: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});