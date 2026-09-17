import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DISH_SUGGESTIONS = [
  { name: "Avocado Toast", min: 8, max: 16 },
  { name: "Margherita Pizza", min: 12, max: 22 },
  { name: "Caesar Salad", min: 9, max: 15 },
  { name: "Sushi Roll Platter", min: 15, max: 35 },
  { name: "Cheeseburger & Fries", min: 10, max: 18 },
  { name: "Pad Thai", min: 11, max: 17 },
  { name: "Ramen Bowl", min: 13, max: 20 },
  { name: "Smoothie Bowl", min: 7, max: 13 },
  { name: "Grilled Salmon", min: 18, max: 32 },
  { name: "Chicken Tikka Masala", min: 14, max: 24 },
  { name: "Tacos al Pastor", min: 8, max: 14 },
  { name: "Poke Bowl", min: 12, max: 22 },
  { name: "Pasta Carbonara", min: 13, max: 21 },
  { name: "French Onion Soup", min: 7, max: 12 },
  { name: "Eggs Benedict", min: 12, max: 20 },
  { name: "Korean BBQ Bibimbap", min: 13, max: 22 },
  { name: "Fish & Chips", min: 11, max: 19 },
  { name: "Margherita Flatbread", min: 9, max: 15 },
  { name: "Vegan Buddha Bowl", min: 10, max: 16 },
  { name: "Lobster Roll", min: 20, max: 38 },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Pick a pseudo-random dish based on timestamp for variety
    const seed = Date.now();
    const dish = DISH_SUGGESTIONS[seed % DISH_SUGGESTIONS.length];
    const estimatedPrice = +(dish.min + ((seed % 100) / 100) * (dish.max - dish.min)).toFixed(2);

    return new Response(
      JSON.stringify({
        dish_name: dish.name,
        estimated_price: estimatedPrice,
        confidence: 0.72 + ((seed % 28) / 100),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
