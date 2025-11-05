import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  customerName: string;
  reference: string;
  type: 'submission' | 'approved' | 'rejected';
  serviceType: 'warehouse' | 'transportation';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, reference, type, serviceType }: EmailRequest = await req.json();

    console.log(`Sending ${type} email for ${reference} to ${to}`);

    let subject = '';
    let html = '';

    const serviceLabel = serviceType === 'warehouse' ? 'Warehouse' : 'Transportation';

    if (type === 'submission') {
      subject = `${serviceLabel} Request Submitted - ${reference}`;
      html = `
        <h1>Request Submitted Successfully</h1>
        <p>Dear ${customerName},</p>
        <p>Your ${serviceLabel.toLowerCase()} service request has been submitted successfully.</p>
        <p><strong>Reference Number:</strong> ${reference}</p>
        <p>Our operations team will review your request and get back to you shortly.</p>
        <p>You can track the status of your request in your dashboard.</p>
        <br>
        <p>Best regards,<br>UPL Platform Team</p>
      `;
    } else if (type === 'approved') {
      subject = `Request Approved - ${reference}`;
      html = `
        <h1>Request Approved</h1>
        <p>Dear ${customerName},</p>
        <p>Great news! Your ${serviceLabel.toLowerCase()} service request has been <strong>approved</strong>.</p>
        <p><strong>Reference Number:</strong> ${reference}</p>
        <p>We will proceed with processing your request. You will receive further updates via email.</p>
        <br>
        <p>Best regards,<br>UPL Platform Team</p>
      `;
    } else if (type === 'rejected') {
      subject = `Request Status Update - ${reference}`;
      html = `
        <h1>Request Status Update</h1>
        <p>Dear ${customerName},</p>
        <p>We regret to inform you that your ${serviceLabel.toLowerCase()} service request has been <strong>rejected</strong>.</p>
        <p><strong>Reference Number:</strong> ${reference}</p>
        <p>Please contact our support team for more information or to submit a revised request.</p>
        <br>
        <p>Best regards,<br>UPL Platform Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "UPL Platform <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-request-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
