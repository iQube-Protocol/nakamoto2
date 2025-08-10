import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Missing Supabase env configuration");
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // User-scoped client to extract the authenticated user (no privileged ops)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData?.user?.email) {
      console.error("Auth error or missing email:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const user = authData.user;
    const email = user.email as string;
    const userId = user.id as string;

    // Admin client for privileged DB operations (bypass RLS)
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // 1) Ensure invited_users placeholder exists and is completed
    const { data: existingInvite, error: inviteFetchErr } = await admin
      .from("invited_users")
      .select("id, signup_completed, batch_id")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (inviteFetchErr) {
      console.error("Error fetching invited_users:", inviteFetchErr);
    }

    if (!existingInvite) {
      const { error: insertErr } = await admin.from("invited_users").insert({
        email,
        persona_type: "knyt",
        persona_data: { Email: email },
        signup_completed: true,
        completed_at: new Date().toISOString(),
        batch_id: "direct_signup",
        email_sent: false,
      });
      if (insertErr) {
        console.error("Error inserting invited_users placeholder:", insertErr);
        // Don't fail the whole request; continue to persona ensure
      }
    } else if (!existingInvite.signup_completed) {
      const { error: updateErr } = await admin
        .from("invited_users")
        .update({
          signup_completed: true,
          completed_at: new Date().toISOString(),
          batch_id: existingInvite.batch_id ?? "direct_signup",
        })
        .eq("id", existingInvite.id);
      if (updateErr) {
        console.error("Error updating invited_users to completed:", updateErr);
      }
    }

    // 2) Ensure at least one persona exists (prefer knyt)
    const [{ data: knyt, error: knytErr }, { data: qrypto, error: qryptoErr }] = await Promise.all([
      admin.from("knyt_personas").select("id").eq("user_id", userId).limit(1).maybeSingle(),
      admin.from("qrypto_personas").select("id").eq("user_id", userId).limit(1).maybeSingle(),
    ]);

    if (knytErr) console.error("Error checking knyt_personas:", knytErr);
    if (qryptoErr) console.error("Error checking qrypto_personas:", qryptoErr);

    if (!knyt && !qrypto) {
      const { error: personaInsertErr } = await admin.from("knyt_personas").insert({
        user_id: userId,
        "Email": email,
      });
      if (personaInsertErr) {
        console.error("Error creating default KNYT persona:", personaInsertErr);
        // Try qrypto as a fallback
        const { error: qryptoInsertErr } = await admin.from("qrypto_personas").insert({
          user_id: userId,
          "Email": email,
        });
        if (qryptoInsertErr) {
          console.error("Fallback qrypto persona creation failed:", qryptoInsertErr);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, email, userId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("Unhandled error in reconcile-direct-signup:", e);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
