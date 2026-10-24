import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function verifyHmac(body: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = new Uint8Array(
    signature.match(/.{2}/g)?.map((b) => parseInt(b, 16)) ?? [],
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(body));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    const signature = req.headers.get("X-Vinyl-Signature") ?? "";
    const webhookSecret = Deno.env.get("VINYL_WEBHOOK_SECRET") ?? "";

    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const valid = await verifyHmac(rawBody, signature, webhookSecret);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const { user_id, payment_id, amount, status } = payload;

    if (!user_id || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (status === "approved" && payment_id) {
      const { error: payError } = await supabase
        .from("payments")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", payment_id)
        .eq("user_id", user_id);

      if (payError) {
        return new Response(JSON.stringify({ error: "Failed to update payment" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ tier: "premium" })
        .eq("id", user_id);

      if (profileError) {
        return new Response(JSON.stringify({ error: "Failed to upgrade tier" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (status === "rejected" && payment_id) {
      const { error: payError } = await supabase
        .from("payments")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", payment_id)
        .eq("user_id", user_id);

      if (payError) {
        return new Response(JSON.stringify({ error: "Failed to update payment" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (status === "submitted") {
      const { data: payment, error: insertError } = await supabase
        .from("payments")
        .insert({
          user_id,
          amount: amount ?? "",
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError || !payment) {
        return new Response(JSON.stringify({ error: "Failed to create payment record" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ payment_id: payment.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Unknown status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
