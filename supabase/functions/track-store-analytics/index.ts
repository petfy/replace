
// Follow this setup guide to integrate the Deno standard library
// https://deno.land/manual/examples/standard_library

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a single supabase client for interacting with your database
const supabaseUrl = "https://riclirqvaxqlvbhfsowh.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method === "POST") {
      // Parse request body
      const { store_id, event_type } = await req.json();
      console.log(`Received tracking event: ${event_type} for store: ${store_id}`);

      if (!store_id || !event_type) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required parameters" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Validate event type
      const validEventTypes = ["view", "click", "discount_usage"];
      if (!validEventTypes.includes(event_type)) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid event type" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Check if store exists
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("id", store_id)
        .single();

      if (storeError || !storeData) {
        console.error("Store not found:", store_id, storeError);
        return new Response(
          JSON.stringify({ success: false, error: "Store not found" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }

      // Update analytics based on event type
      const currentDate = new Date().toISOString().split("T")[0];
      let updateField;

      switch (event_type) {
        case "view":
          updateField = "view_count";
          break;
        case "click":
          updateField = "click_count";
          break;
        case "discount_usage":
          updateField = "discount_usage_count";
          break;
      }

      // Update overall analytics
      const { error: analyticsError } = await supabase
        .from("store_analytics")
        .update({
          [updateField]: supabase.sql`${updateField} + 1`,
          last_updated: new Date().toISOString(),
        })
        .eq("store_id", store_id);

      if (analyticsError) {
        console.error("Error updating analytics:", analyticsError);
      }

      // Try to get existing daily stat for this date
      const { data: existingStat, error: statCheckError } = await supabase
        .from("store_daily_stats")
        .select("*")
        .eq("store_id", store_id)
        .eq("date", currentDate)
        .single();

      if (statCheckError && statCheckError.code !== "PGRST116") {
        console.error("Error checking daily stats:", statCheckError);
      }

      if (existingStat) {
        // Update existing daily stat
        const { error: updateStatError } = await supabase
          .from("store_daily_stats")
          .update({
            [updateField]: supabase.sql`${updateField} + 1`,
          })
          .eq("id", existingStat.id);

        if (updateStatError) {
          console.error("Error updating daily stat:", updateStatError);
        }
      } else {
        // Create new daily stat
        const newStat = {
          store_id: store_id,
          date: currentDate,
          view_count: event_type === "view" ? 1 : 0,
          click_count: event_type === "click" ? 1 : 0,
          discount_usage_count: event_type === "discount_usage" ? 1 : 0,
        };

        const { error: insertStatError } = await supabase
          .from("store_daily_stats")
          .insert([newStat]);

        if (insertStatError) {
          console.error("Error inserting daily stat:", insertStatError);
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
