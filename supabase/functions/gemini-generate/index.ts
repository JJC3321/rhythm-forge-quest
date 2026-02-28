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
    const { playlistName, metrics } = await req.json();
    if (!playlistName) throw new Error("Missing playlist name");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Build a rich prompt using real Spotify metrics if available
    let metricsBlock = "";
    if (metrics) {
      metricsBlock = `
REAL SPOTIFY AUDIO ANALYSIS:
- Average Tempo: ${metrics.avgTempo} BPM
- Energy: ${metrics.avgEnergy} (0=calm, 1=intense)
- Danceability: ${metrics.avgDanceability} (0=not danceable, 1=very danceable)
- Valence (happiness): ${metrics.avgValence} (0=sad/dark, 1=happy/bright)
- Acousticness: ${metrics.avgAcousticness} (0=electronic, 1=acoustic)
- Loudness: ${metrics.avgLoudness} dB
- Track count: ${metrics.trackCount}

USE THESE REAL METRICS to design the visual theme. The game MUST feel like the music:
- High energy (>0.7) → high difficulty (7-10), neon/bold colors
- Low energy (<0.3) → low difficulty (1-4), softer colors
- Low valence (<0.3) → dark moody colors (deep purples, blues, reds)
- High valence (>0.7) → bright vibrant colors (cyan, yellow, green)
- Map energy to difficulty: difficulty ≈ energy * 10
- Map energy to playerSpeed: playerSpeed ≈ 150 + energy * 250
- Map tempo to gravity feel: gravity ≈ 0.8 + (tempo/200) * 1.2`;
    }

    const prompt = `You are a game designer AI. Design a GEOMETRY DASH style auto-scrolling runner game themed by this playlist's music.

Playlist: "${playlistName}"
${metricsBlock}

The game type is ALWAYS "geodash" — a Geometry Dash style side-scrolling auto-runner where the player cube auto-moves right and the player taps/clicks to jump over spikes and obstacles.

Configure: gravity (0.5-2.0), playerSpeed (150-400, controls scroll speed), spawnRateMs (500-2000, obstacle spacing), difficulty (1-10).
Use a dark background color. Make the color palette match the music's mood. Be creative with the title (max 30 chars).
In musicInfluence, explain HOW the music metrics shaped your visual design decisions.

ASSET DESIGN - You MUST also design visual assets that match the music:
- Player: use "diamond" shape (classic GD cube feel) or "hexagon" for variety. Style "neon" for electronic, "gradient" for pop, "solid" for rock
- Player eyes: true for fun/happy music, false for dark/intense
- Enemies (spikes/obstacles): design 2-3 types with "triangle" (spike), "diamond" (block), "bolt" (hazard) shapes
- Enemy style: "neon" for electronic, "solid" for heavy, match glowColor to enemies palette color
- Collectible: use "star" or "circle" with bright glow, "neon" or "gradient" style
- Platform style: "glowing" for electronic, "gradient" for pop, "striped" for rock, "solid" for acoustic
- Background: more particles (30-40) for energetic music, fewer (10-15) for calm; starfield=true for spacey/ambient
- All colors should use hex format (#RRGGBB) and match the music mood
- glowColor should be a bright/saturated version of the primaryColor`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const toolDeclaration = {
      name: "create_game_config",
      description: "Create a game configuration based on playlist mood analysis",
      parameters: {
        type: "object",
        properties: {
          gameType: { type: "string", enum: ["geodash"] },
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
          },
          enemyTypes: { type: "array", items: { type: "string" } },
          backgroundTheme: { type: "string" },
          musicInfluence: { type: "string" },
          assets: {
            type: "object",
            properties: {
              player: {
                type: "object",
                properties: {
                  shape: { type: "string", enum: ["circle", "diamond", "triangle", "star", "hexagon", "crescent", "bolt"] },
                  primaryColor: { type: "string" },
                  secondaryColor: { type: "string" },
                  glowColor: { type: "string" },
                  style: { type: "string", enum: ["solid", "outlined", "gradient", "neon"] },
                  eyes: { type: "boolean" },
                },
                required: ["shape", "primaryColor", "secondaryColor", "glowColor", "style", "eyes"],
              },
              enemies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    shape: { type: "string", enum: ["circle", "diamond", "triangle", "star", "hexagon", "crescent", "bolt"] },
                    primaryColor: { type: "string" },
                    secondaryColor: { type: "string" },
                    glowColor: { type: "string" },
                    style: { type: "string", enum: ["solid", "outlined", "gradient", "neon"] },
                    eyes: { type: "boolean" },
                  },
                  required: ["shape", "primaryColor", "secondaryColor", "glowColor", "style", "eyes"],
                },
              },
              collectible: {
                type: "object",
                properties: {
                  shape: { type: "string", enum: ["circle", "diamond", "triangle", "star", "hexagon", "crescent", "bolt"] },
                  primaryColor: { type: "string" },
                  secondaryColor: { type: "string" },
                  glowColor: { type: "string" },
                  style: { type: "string", enum: ["solid", "outlined", "gradient", "neon"] },
                  eyes: { type: "boolean" },
                },
                required: ["shape", "primaryColor", "secondaryColor", "glowColor", "style", "eyes"],
              },
              platform: {
                type: "object",
                properties: {
                  style: { type: "string", enum: ["solid", "gradient", "striped", "glowing"] },
                  primaryColor: { type: "string" },
                  accentColor: { type: "string" },
                },
                required: ["style", "primaryColor", "accentColor"],
              },
              background: {
                type: "object",
                properties: {
                  particleColor: { type: "string" },
                  particleShape: { type: "string", enum: ["circle", "diamond", "triangle", "star", "hexagon", "crescent", "bolt"] },
                  particleCount: { type: "number" },
                  starfield: { type: "boolean" },
                  ambientColor: { type: "string" },
                },
                required: ["particleColor", "particleShape", "particleCount", "starfield", "ambientColor"],
              },
            },
            required: ["player", "enemies", "collectible", "platform", "background"],
          },
        },
        required: ["gameType", "title", "description", "gravity", "playerSpeed", "spawnRateMs", "difficulty", "colorPalette", "enemyTypes", "backgroundTheme", "musicInfluence", "assets"],
      },
    };

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "You are a creative game designer. Always use the provided tool to return structured game configurations. The game MUST reflect the music's real audio characteristics." }],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ function_declarations: [toolDeclaration] }],
        tool_config: { function_calling_config: { mode: "ANY", allowed_function_names: ["create_game_config"] } },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const functionCall = data.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall)?.functionCall;
    if (!functionCall) throw new Error("No function call response from Gemini");

    const gameConfig = functionCall.args;

    // Clamp values
    gameConfig.gameType = "geodash";
    gameConfig.gravity = Math.max(0.5, Math.min(2.0, gameConfig.gravity));
    gameConfig.playerSpeed = Math.max(150, Math.min(400, gameConfig.playerSpeed));
    gameConfig.spawnRateMs = Math.max(500, Math.min(2000, gameConfig.spawnRateMs));
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
