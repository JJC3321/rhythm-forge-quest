import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import asset integration (note: this would need to be adapted for Deno environment)
// For now, we'll include asset information directly in the prompt

// ─── Geometry Dash Asset Information ───────
// These are the authentic Geometry Dash assets available for map generation

const GEOMETRY_DASH_ASSETS = `
AVAILABLE GEOMETRY DASH ASSETS:
You have access to authentic Geometry Dash game assets that should be used to create visually authentic levels.

PLAYER ASSETS:
- Player Cube: Original Geometry Dash cube sprite with rotation animation and eye tracking
- Multiple cube variations with different colors and effects

GROUND ASSETS:
- Ground Tile 1: Stone texture with HD detail
- Ground Tile 2: Metal texture with industrial look  
- Ground Tile 3: Crystal texture with glowing edges
- Ground Tile 4: Grass texture with natural appearance
- Ground Tile 5: Lava texture with animated glow

BACKGROUND ASSETS:
- Background 1: City skyline with neon lights (perfect for high energy tracks)
- Background 2: Space/starscape with nebula effects (good for atmospheric tracks)
- Background 3: Underground cave system (ideal for dark/intense tracks)
- Background 4: Sky/clouds with sun rays (great for happy/upbeat tracks)
- Background 5: Industrial factory with machinery (good for electronic tracks)

OBSTACLE ASSETS:
- Spikes: Classic triangle spikes with glowing tips and shadow effects
- Blocks: Square/rectangular obstacles with beveled edges and inner details
- Triggers: Special activation objects with particle effects and color cycling

SPECIAL EFFECTS:
- Portals: Circular transition effects with particle bursts and color shifting
- Death Effects: Explosion particles and screen effects on collision
- Collectibles: Coins and user coins with spinning animations

VISUAL THEMES:
1. NEON CITY: Primary #ff00ff, Secondary #00ffff, Glow #ff00ff, Background #0a0a0a
   Effects: glow_pulse, particle_burst, color_shift
   Recommended: Background 1, Ground 1, Portals
   
2. RETRO ARCADE: Primary #ff6b35, Secondary #f7931e, Glow #ff6b35, Background #2d1b69  
   Effects: screen_shake, glow_pulse
   Recommended: Background 2, Ground 2, Spikes
   
3. DARK UNDERGROUND: Primary #8b0000, Secondary #4b0082, Glow #8b0000, Background #000000
   Effects: screen_shake, particle_burst  
   Recommended: Background 0, Ground 3, Triggers
   
4. BRIGHT SKY: Primary #00ff00, Secondary #ffff00, Glow #00ff00, Background #87ceeb
   Effects: particle_burst, color_shift
   Recommended: Background 3, Ground 4, Portals

ASSET USAGE GUIDELINES:
1. Use authentic Geometry Dash sprites for all obstacles
2. Apply theme colors as overlays/filters to maintain asset recognition  
3. Rotate and scale assets appropriately for visual variety
4. Use portal assets for song transitions and mode changes
5. Ground assets should be tiled seamlessly for continuous platforms
6. Background assets should be parallax layered for depth
7. Include asset references in visualTheme configuration
`;

// ─── Reference Maps (popular Geometry Dash level patterns) ───────
// These are proven-playable patterns from well-known GD levels, used as
// few-shot examples so Gemini generates variations rather than broken maps.

const PLAYABILITY_RULES = `
CRITICAL PLAYABILITY RULES — every pattern MUST satisfy ALL of these or the level is unbeatable:
1. spacing >= 80  — minimum px gap between obstacles so the player can physically jump over them
2. spikeCount <= 5 — more consecutive spikes than this cannot be jumped in one leap
3. blockWidth <= 70 — blocks wider than 70px are unjumpable
4. gapWidth between 60-120 — gaps below 60 feel like nothing, above 120 are impossible to cross
5. density <= 0.7 at absolute maximum — even the hardest GD levels never exceed this; 0.6 is a safe peak
6. Every 3-5 obstacle patterns MUST be followed by a breather pattern (type "gaps" or "collectibles", density <= 0.25, duration >= 4000ms)
7. Difficulty must ramp gradually: never jump more than +2 difficulty between consecutive patterns
8. The FIRST pattern must have difficulty <= 3 (give the player time to react)
9. The LAST pattern must have difficulty <= 3 (cool-down / outro)
10. Total pattern count: 8-12 for a typical song
`.trim();

interface RefMap {
  name: string;
  energy: number;
  tempo: number;
  dance: number;
  serialized: string;
}

// Compact serializations of popular GD level patterns
const REFERENCE_MAPS: RefMap[] = [
  {
    name: "Stereo Madness (Easy)",
    energy: 0.6, tempo: 120, dance: 0.5,
    serialized: `Reference: "Stereo Madness" | Easy | 92s | energy=0.6 tempo=120
Difficulty curve: [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.35, 0.30, 0.20]
Patterns:
  spikes        t=0-8000ms       density=0.15  diff=1  spacing=200  spikes=1
  spikes        t=8000-18000ms   density=0.25  diff=2  spacing=160  spikes=2
  blocks        t=18000-28000ms  density=0.25  diff=2  spacing=150  blockW=40
  mixed         t=28000-40000ms  density=0.30  diff=3  spacing=140
  collectibles  t=40000-46000ms  density=0.20  diff=1  spacing=120  coins=6
  spikes        t=46000-58000ms  density=0.35  diff=4  spacing=120  spikes=3
  gaps          t=58000-66000ms  density=0.20  diff=3  spacing=160  gapW=80
  mixed         t=66000-80000ms  density=0.40  diff=4  spacing=110
  spikes        t=80000-88000ms  density=0.15  diff=2  spacing=200  spikes=1
  collectibles  t=88000-92000ms  density=0.15  diff=1  spacing=140  coins=4`,
  },
  {
    name: "Polargeist (Normal)",
    energy: 0.7, tempo: 140, dance: 0.6,
    serialized: `Reference: "Polargeist" | Normal | 108s | energy=0.7 tempo=140
Difficulty curve: [0.15, 0.25, 0.35, 0.45, 0.50, 0.55, 0.60, 0.55, 0.40, 0.25]
Patterns:
  spikes        t=0-8000ms        density=0.20  diff=2  spacing=180  spikes=2
  mixed         t=8000-20000ms    density=0.30  diff=3  spacing=140
  spikes        t=20000-34000ms   density=0.40  diff=5  spacing=90   spikes=4
  blocks        t=34000-44000ms   density=0.35  diff=4  spacing=120  blockW=50
  collectibles  t=44000-50000ms   density=0.25  diff=2  spacing=100  coins=7
  mixed         t=50000-66000ms   density=0.45  diff=6  spacing=100
  gaps          t=66000-76000ms   density=0.30  diff=5  spacing=130  gapW=100
  spikes        t=76000-90000ms   density=0.50  diff=6  spacing=85   spikes=5
  blocks        t=90000-100000ms  density=0.25  diff=3  spacing=150  blockW=40
  collectibles  t=100000-108000ms density=0.15  diff=1  spacing=120  coins=5`,
  },
  {
    name: "Base After Base (Hard)",
    energy: 0.8, tempo: 145, dance: 0.65,
    serialized: `Reference: "Base After Base" | Hard | 115s | energy=0.8 tempo=145
Difficulty curve: [0.20, 0.35, 0.45, 0.55, 0.65, 0.70, 0.75, 0.70, 0.55, 0.35]
Patterns:
  mixed         t=0-10000ms       density=0.25  diff=3  spacing=150
  spikes        t=10000-22000ms   density=0.35  diff=4  spacing=120  spikes=3
  spikes        t=22000-36000ms   density=0.50  diff=6  spacing=85   spikes=5
  blocks        t=36000-48000ms   density=0.45  diff=6  spacing=100  blockW=55
  collectibles  t=48000-54000ms   density=0.25  diff=2  spacing=100  coins=8
  mixed         t=54000-72000ms   density=0.55  diff=7  spacing=85
  spikes        t=72000-88000ms   density=0.55  diff=8  spacing=80   spikes=5
  gaps          t=88000-98000ms   density=0.35  diff=6  spacing=120  gapW=100
  mixed         t=98000-108000ms  density=0.30  diff=4  spacing=130
  collectibles  t=108000-115000ms density=0.15  diff=1  spacing=130  coins=5`,
  },
  {
    name: "Jumper (Harder)",
    energy: 0.85, tempo: 160, dance: 0.7,
    serialized: `Reference: "Jumper" | Harder | 118s | energy=0.85 tempo=160
Difficulty curve: [0.30, 0.40, 0.50, 0.60, 0.70, 0.75, 0.80, 0.75, 0.60, 0.35]
Patterns:
  mixed         t=0-10000ms        density=0.30  diff=4  spacing=130
  spikes        t=10000-26000ms    density=0.50  diff=6  spacing=90   spikes=5
  blocks        t=26000-36000ms    density=0.40  diff=5  spacing=110  blockW=50
  spikes        t=36000-52000ms    density=0.55  diff=7  spacing=85   spikes=5
  collectibles  t=52000-58000ms    density=0.20  diff=2  spacing=100  coins=8
  gaps          t=58000-70000ms    density=0.40  diff=6  spacing=110  gapW=100
  mixed         t=70000-90000ms    density=0.60  diff=8  spacing=80
  spikes        t=90000-104000ms   density=0.60  diff=8  spacing=80   spikes=5
  blocks        t=104000-112000ms  density=0.25  diff=3  spacing=150  blockW=40
  collectibles  t=112000-118000ms  density=0.15  diff=1  spacing=130  coins=5`,
  },
  {
    name: "Cycles (Harder, Danceable)",
    energy: 0.8, tempo: 145, dance: 0.85,
    serialized: `Reference: "Cycles" | Harder/Danceable | 110s | energy=0.8 tempo=145 dance=0.85
Difficulty curve: [0.25, 0.35, 0.50, 0.60, 0.70, 0.75, 0.80, 0.70, 0.50, 0.30]
Patterns:
  spikes        t=0-10000ms        density=0.25  diff=3  spacing=140  spikes=2
  mixed         t=10000-24000ms    density=0.40  diff=5  spacing=110
  spikes        t=24000-38000ms    density=0.50  diff=6  spacing=90   spikes=4
  blocks        t=38000-48000ms    density=0.40  diff=5  spacing=110  blockW=50
  collectibles  t=48000-54000ms    density=0.20  diff=2  spacing=100  coins=8
  mixed         t=54000-72000ms    density=0.55  diff=7  spacing=85
  spikes        t=72000-86000ms    density=0.55  diff=8  spacing=80   spikes=5
  gaps          t=86000-94000ms    density=0.30  diff=5  spacing=120  gapW=90
  mixed         t=94000-104000ms   density=0.30  diff=4  spacing=130
  collectibles  t=104000-110000ms  density=0.15  diff=1  spacing=120  coins=5`,
  },
];

function selectReferenceMap(energy: number, tempo: number, danceability: number): RefMap {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < REFERENCE_MAPS.length; i++) {
    const r = REFERENCE_MAPS[i];
    const dist =
      Math.abs(r.energy - energy) * 2 +
      Math.abs((r.tempo - tempo) / 200) +
      Math.abs(r.dance - danceability);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return REFERENCE_MAPS[bestIdx];
}

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
    const { track } = await req.json();
    if (!track || !track.id) throw new Error("Missing track data");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Analyze sentiment based on audio features
    const sentiment = analyzeSentiment(track);
    
    // Select the closest reference map for this track's characteristics
    const refMap = selectReferenceMap(track.energy, track.tempo, track.danceability);

    const prompt = `You are a rhythm game level designer for a Geometry Dash-style auto-runner.
Your job is to create a VARIATION of a proven-playable reference level, adapted to fit this specific song.
Do NOT invent patterns from scratch — use the reference as your template and adjust timing, density, and theme to match the song.

${GEOMETRY_DASH_ASSETS}

SONG DATA:
- Name: "${track.name}"
- Artist: "${track.artist}"
- Duration: ${Math.round(track.durationMs / 1000)}s (${track.durationMs}ms total)
- Energy: ${track.energy} (0=calm, 1=intense)
- Valence: ${track.valence} (0=sad/dark, 1=happy/bright)
- Danceability: ${track.danceability} (0=not danceable, 1=very danceable)
- Acousticness: ${track.acousticness} (0=electronic, 1=acoustic)
- Tempo: ${track.tempo} BPM

SENTIMENT ANALYSIS:
${sentiment.analysis}

${PLAYABILITY_RULES}

REFERENCE LEVEL TO BASE YOUR VARIATION ON (${refMap.name}):
${refMap.serialized}

THEME SELECTION GUIDELINES:
- If energy > 0.7 AND valence > 0.6: Use NEON CITY theme
- If energy > 0.5 AND valence < 0.4: Use DARK UNDERGROUND theme  
- If acousticness > 0.5 OR danceability < 0.3: Use RETRO ARCADE theme
- Otherwise: Use BRIGHT SKY theme

HOW TO CREATE YOUR VARIATION:
1. Use the reference level as a structural template — keep the same pattern flow (intro → build → climax → breather → finale → cool-down)
2. Scale all startTime and duration values proportionally to fit this song's duration (${track.durationMs}ms)
3. Adjust density and difficulty based on this song's energy (${track.energy}) vs the reference energy (${refMap.energy})
4. If energy is HIGHER than reference, increase density by up to +0.1 and difficulty by up to +1, decrease spacing by up to -10
5. If energy is LOWER than reference, decrease density by up to -0.1 and difficulty by up to -1, increase spacing by up to +20
6. Select and apply the appropriate visual theme based on the song characteristics
7. Include specific asset references in your visualTheme configuration
8. NEVER violate the playability rules above — they are non-negotiable
9. Pattern startTimes must be contiguous (each starts where the previous ends) and cover the full song duration
10. Include at least one "collectibles" or "gaps" breather pattern every 3-5 patterns

The map should feel like it was "composed" specifically for this song while remaining 100% beatable and using authentic Geometry Dash assets.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const toolDeclaration = {
      name: "create_song_map",
      description: "Create a song-specific map configuration based on audio analysis",
      parameters: {
        type: "object",
        properties: {
          trackId: { type: "string" },
          patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["spikes", "blocks", "gaps", "collectibles", "mixed"] },
                startTime: { type: "number" },
                duration: { type: "number" },
                density: { type: "number", minimum: 0, maximum: 1 },
                difficulty: { type: "number", minimum: 1, maximum: 10 },
                spacing: { type: "number" },
                spikeCount: { type: "number" },
                blockWidth: { type: "number" },
                gapWidth: { type: "number" },
                collectibleCount: { type: "number" },
                visualModifiers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["color_shift", "particle_burst", "screen_shake", "glow_pulse"] },
                      intensity: { type: "number", minimum: 0, maximum: 1 },
                      startTime: { type: "number" },
                      duration: { type: "number" },
                    },
                    required: ["type", "intensity", "startTime", "duration"],
                  },
                },
              },
              required: ["id", "type", "startTime", "duration", "density", "difficulty", "spacing"],
            },
          },
          difficultyCurve: {
            type: "array",
            items: { type: "number", minimum: 0, maximum: 1 },
            description: "Difficulty progression throughout the song (0-1 normalized, 10 points)"
          },
          visualTheme: {
            type: "object",
            properties: {
              name: { type: "string" },
              obstacleColor: { type: "string" },
              obstacleGlow: { type: "string" },
              backgroundColor: { type: "string" },
              particleColor: { type: "string" },
              specialEffects: {
                type: "array",
                items: { type: "string" }
              },
              assetReferences: {
                type: "object",
                properties: {
                  playerSprite: { type: "string" },
                  groundSprites: {
                    type: "array",
                    items: { type: "string" }
                  },
                  backgroundSprites: {
                    type: "array", 
                    items: { type: "string" }
                  },
                  obstacleSprites: {
                    type: "array",
                    items: { type: "string" }
                  },
                  portalSprites: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            required: ["name", "obstacleColor", "obstacleGlow", "backgroundColor", "particleColor", "specialEffects"],
          },
          totalDuration: { type: "number" },
          version: { type: "string" },
        },
        required: ["trackId", "patterns", "difficultyCurve", "visualTheme", "totalDuration", "version"],
      },
    };

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "You are an expert Geometry Dash level designer. You create variations of proven-playable reference levels adapted to specific songs. You NEVER violate playability constraints. Always use the provided tool to return structured map data." }],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ function_declarations: [toolDeclaration] }],
        tool_config: { function_calling_config: { mode: "ANY", allowed_function_names: ["create_song_map"] } },
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

    const songMap = functionCall.args;
    
    // Add metadata
    songMap.generatedAt = Date.now();
    songMap.trackId = track.id;

    // Post-process: enforce playability constraints as a safety net
    if (songMap.patterns && Array.isArray(songMap.patterns)) {
      for (const p of songMap.patterns) {
        p.spacing = Math.max(80, p.spacing || 100);
        p.density = Math.max(0, Math.min(0.7, p.density || 0.3));
        p.difficulty = Math.max(1, Math.min(10, p.difficulty || 3));
        if (p.spikeCount) p.spikeCount = Math.min(5, p.spikeCount);
        if (p.blockWidth) p.blockWidth = Math.min(70, p.blockWidth);
        if (p.gapWidth) p.gapWidth = Math.max(60, Math.min(120, p.gapWidth));
      }
      // Ensure first pattern is easy
      if (songMap.patterns.length > 0) {
        songMap.patterns[0].difficulty = Math.min(3, songMap.patterns[0].difficulty);
      }
      // Ensure last pattern is easy
      if (songMap.patterns.length > 1) {
        const last = songMap.patterns[songMap.patterns.length - 1];
        last.difficulty = Math.min(3, last.difficulty);
      }
    }

    return new Response(JSON.stringify(songMap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("gemini-generate-map error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function analyzeSentiment(track: any): { analysis: string; theme: string } {
  const { energy, valence, danceability, acousticness, tempo } = track;
  
  let analysis = "";
  let theme = "";
  
  // Energy analysis
  if (energy > 0.7) {
    analysis += "High energy track - requires intense, dense obstacle patterns with rapid transitions. ";
    theme = "neon";
  } else if (energy < 0.3) {
    analysis += "Low energy track - sparse but deliberate obstacles, focus on precision. ";
    theme = "minimal";
  } else {
    analysis += "Moderate energy - balanced obstacle density with varied pacing. ";
    theme = "balanced";
  }
  
  // Valence (happiness) analysis
  if (valence < 0.3) {
    analysis += "Dark/moody atmosphere - use darker colors, challenging but fair patterns. ";
    theme += "_dark";
  } else if (valence > 0.7) {
    analysis += "Bright/happy mood - vibrant colors, flowing patterns, collectible-heavy sections. ";
    theme += "_bright";
  }
  
  // Danceability analysis
  if (danceability > 0.7) {
    analysis += "Highly danceable - create rhythmic, predictable patterns that match the beat. ";
  } else if (danceability < 0.3) {
    analysis += "Not danceable - focus on atmospheric, varied obstacle placement. ";
  }
  
  // Acousticness analysis
  if (acousticness > 0.6) {
    analysis += "Acoustic nature - organic, flowing obstacle movements, natural color palette. ";
    theme += "_organic";
  } else if (acousticness < 0.2) {
    analysis += "Electronic production - sharp, geometric patterns, digital aesthetics. ";
    theme += "_digital";
  }
  
  // Tempo analysis
  if (tempo > 140) {
    analysis += "Fast tempo - quick obstacle succession, minimal spacing. ";
  } else if (tempo < 90) {
    analysis += "Slow tempo - deliberate obstacle placement, emphasis on timing. ";
  }
  
  return { analysis, theme };
}
