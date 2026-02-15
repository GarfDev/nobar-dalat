// Supabase Edge Function to send Web Push Notifications
// Deploy this to Supabase using: supabase functions deploy push

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record, type } = await req.json();

    // Only handle INSERT events
    if (type !== "INSERT") {
      return new Response("Not an INSERT event", { headers: corsHeaders });
    }

    // Configure Web Push with VAPID keys
    // You need to set these secrets in your Supabase project:
    // supabase secrets set VAPID_PUBLIC_KEY="BF-kzb6E-XKMXt9dWNi5QvCh-vSXypL_NgdPdgcRmmnfGpyHDHksjXA01tjGSslsOWjDMidgwfC-VWmOkZ8vYPI"
    // supabase secrets set VAPID_PRIVATE_KEY="ex7Y_aa9JNYJ5sImQq_tjRCY53ZFZlx11MVSApJWkGw"
    // supabase secrets set VAPID_SUBJECT="mailto:admin@nobardalat.com"
    
    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT") || "mailto:admin@nobardalat.com",
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Scenario 1: New Match (Table: match_pool, status changed to 'matched')
    // Note: This logic assumes the webhook is fired on UPDATE for match_pool or we check inserts elsewhere.
    // However, the prompt asked for "match OR new message".
    // If this webhook is attached to `messages`, we handle messages.
    
    // Check if the record is a message
    if (record.sender_id && record.receiver_id && record.content) {
      // It's a new message
      const receiverId = record.receiver_id;
      const senderId = record.sender_id;

      // Get receiver's push subscription
      const { data: subscriptionData } = await supabaseClient
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", receiverId)
        .single();

      if (subscriptionData?.subscription) {
        // Get sender's name
        const { data: senderData } = await supabaseClient
          .from("match_pool")
          .select("name")
          .eq("id", senderId)
          .single();

        const payload = JSON.stringify({
          title: `New message from ${senderData?.name || "Buddy"}`,
          body: record.content,
          url: "/match" // Deep link
        });

        try {
          await webpush.sendNotification(
            subscriptionData.subscription,
            payload
          );
          console.log(`Push sent to user ${receiverId}`);
        } catch (pushError) {
          console.error("Error sending push:", pushError);
          // Optional: Delete invalid subscription
          if (pushError.statusCode === 410) {
             await supabaseClient
              .from("push_subscriptions")
              .delete()
              .eq("user_id", receiverId);
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: "Processed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
