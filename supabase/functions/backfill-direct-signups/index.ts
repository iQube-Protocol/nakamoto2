import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
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

    // User-scoped client to validate admin permissions
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

    // Check admin using DB function (uses auth.jwt() internally)
    const { data: isAdmin, error: adminCheckErr } = await userClient.rpc("is_admin_user");
    if (adminCheckErr) {
      console.error("Admin check failed:", adminCheckErr);
      return new Response(
        JSON.stringify({ error: "Admin check failed" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Admin client for privileged ops
    const admin = createClient(supabaseUrl, serviceRoleKey);

    let page = 1;
    const perPage = 1000;
    let totalProcessed = 0;
    let totalInvitesInserted = 0;
    let totalPersonasCreated = 0;
    const emailsProcessed: string[] = [];

    // Paginate through all auth users
    while (true) {
      const { data: usersPage, error: listErr } = await admin.auth.admin.listUsers({ page, perPage });
      if (listErr) {
        console.error("Error listing users:", listErr);
        return new Response(
          JSON.stringify({ error: "Failed to list users" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const users = usersPage?.users || [];
      if (users.length === 0) break;

      // Filter valid emails
      const pageUsers = users.filter((u) => !!u.email) as Array<{ id: string; email: string }>;
      const pageEmails = pageUsers.map((u) => u.email as string);

      if (pageEmails.length > 0) {
        // Find which emails already have invited_users records
        const { data: existingInvites, error: invitesErr } = await admin
          .from("invited_users")
          .select("email")
          .in("email", pageEmails);

        if (invitesErr) {
          console.error("Error fetching invited_users for page:", invitesErr);
          // Continue with next page without failing whole request
        } else {
          const existingSet = new Set((existingInvites || []).map((r: any) => r.email));
          const missingUsers = pageUsers.filter((u) => !existingSet.has(u.email));

          if (missingUsers.length > 0) {
            // Insert invited_users placeholders in batch
            const inviteRows = missingUsers.map((u) => ({
              email: u.email,
              persona_type: "knyt",
              persona_data: { Email: u.email },
              signup_completed: true,
              completed_at: new Date().toISOString(),
              batch_id: "direct_signup",
              email_sent: false,
            }));

            const { error: insertInvitesErr } = await admin.from("invited_users").insert(inviteRows);
            if (insertInvitesErr) {
              console.error("Error inserting invited_users rows:", insertInvitesErr);
            } else {
              totalInvitesInserted += missingUsers.length;
              emailsProcessed.push(...missingUsers.map((u) => u.email));

              // Ensure a persona exists for each missing user
              for (const u of missingUsers) {
                try {
                  const { data: knytPersona } = await admin
                    .from("knyt_personas")
                    .select("id")
                    .eq("user_id", u.id)
                    .maybeSingle();

                  const { data: qryptoPersona } = await admin
                    .from("qrypto_personas")
                    .select("id")
                    .eq("user_id", u.id)
                    .maybeSingle();

                  if (!knytPersona && !qryptoPersona) {
                    const { error: personaInsertErr } = await admin.from("knyt_personas").insert({
                      user_id: u.id,
                      Email: u.email,
                    } as any);
                    if (personaInsertErr) {
                      console.error("Error creating default KNYT persona:", personaInsertErr);
                    } else {
                      totalPersonasCreated += 1;
                    }
                  }
                } catch (e) {
                  console.error("Error ensuring persona for user", u.id, e);
                }
              }
            }
          }
        }
      }

      totalProcessed += users.length;
      page += 1;
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalProcessed,
        invitesInserted: totalInvitesInserted,
        personasCreated: totalPersonasCreated,
        emailsProcessed,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("Unhandled error in backfill-direct-signups:", e);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
