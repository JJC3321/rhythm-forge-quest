import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistName } = await req.json();
    if (!playlistName) throw new Error("Missing playlist name");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a game designer AI. Based on the playlist name below, imagine what kind of music it contains and design a game that matches the vibe.

Playlist: "${playlistName}"

Infer the mood, energy, tempo, and style from the playlist name. Then choose a game type:
- "platformer" for energetic/upbeat vibes
- "dodge" for intense/aggressive/dark vibes
- "collector" for calm/chill/acoustic vibes
- "runner" for rhythmic/danceable/groovy vibes

Configure gravity (0.5-2.0), playerSpeed (100-400), spawnRateMs (500-3000, lower=harder), difficulty (1-10).
Use a dark background color. Make the color palette cohesive and mood-matching. Be creative with the title (max 30 chars).`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: "You are a creative game designer. Always use the provided tool to return structured game configurations." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_game_config",
              description: "Create a game configuration based on playlist mood analysis",
              parameters: {
                type: "object",
                properties: {
                  gameType: { type: "string", enum: ["platformer", "dodge", "collector", "runner"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  gravity: { type: "number" },
                  playerSpeed: { type: "number" },
                  spawnRateMs: { type: "number" },
                  difficulty: { type: "number" },
                  colorPalette: {
                    type: "object",
                    properties: {
                      background: { type: "string" },
                      player: { type: "string" },
                      enemies: { type: "string" },
                      collectibles: { type: "string" },
                      platforms: { type: "string" },
                      accent: { type: "string" },
                    },
                    required: ["background", "player", "enemies", "collectibles", "platforms", "accent"],
                    additionalProperties: false,
                  },
                  enemyTypes: { type: "array", items: { type: "string" } },
                  backgroundTheme: { type: "string" },
                  musicInfluence: { type: "string" },
                },
                required: ["gameType", "title", "description", "gravity", "playerSpeed", "spawnRateMs", "difficulty", "colorPalette", "enemyTypes", "backgroundTheme", "musicInfluence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_game_config" } },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await res.text();
      console.error("AI gateway error:", res.status, errText);
      throw new Error(`AI error: ${res.status}`);
    }

    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call response from AI");

    const gameConfig = JSON.parse(toolCall.function.arguments);

    // Clamp values
    gameConfig.gravity = Math.max(0.5, Math.min(2.0, gameConfig.gravity));
    gameConfig.playerSpeed = Math.max(100, Math.min(400, gameConfig.playerSpeed));
    gameConfig.spawnRateMs = Math.max(500, Math.min(3000, gameConfig.spawnRateMs));
    gameConfig.difficulty = Math.max(1, Math.min(10, gameConfig.difficulty || 5));

    return new Response(JSON.stringify(gameConfig), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("gemini-generate error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
