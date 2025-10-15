import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    console.log('Sending contact email from:', email, 'Subject:', subject);

    // Send notification to Fusion Therapeutics
    const emailToSupport = await resend.emails.send({
      from: "Fusion Therapeutics <onboarding@resend.dev>",
      to: ["info@fusiontherapeutics.co.uk"],
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Reply directly to this email to respond to ${email}
        </p>
      `,
      replyTo: email,
    });

    console.log("Support email sent:", emailToSupport);

    // Send confirmation to user
    const emailToUser = await resend.emails.send({
      from: "Fusion Therapeutics <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message",
      html: `
        <h1>Thank you for contacting us, ${name}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        
        <h3>Your Message:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr />
        <p>Best regards,<br>The Fusion Therapeutics Team</p>
        <p style="color: #666; font-size: 12px;">
          If you need immediate assistance, please email us directly at info@fusiontherapeutics.co.uk
        </p>
      `,
    });

    console.log("User confirmation email sent:", emailToUser);

    return new Response(
      JSON.stringify({ 
        success: true,
        supportEmailId: emailToSupport.data?.id,
        userEmailId: emailToUser.data?.id 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
