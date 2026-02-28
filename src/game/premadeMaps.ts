import { SongMap, TrackInfoWithMap } from "@/types/game";

/**
 * Pre-made maps for instant fallback when Gemini is slow.
 * These are designed to be playable for any song and provide variety.
 */

const PREMADE_MAPS: SongMap[] = [
  {
    trackId: "premade_1",
    patterns: [
      {
        id: "intro",
        type: "spikes",
        startTime: 0,
        duration: 8000,
        density: 0.15,
        difficulty: 1,
        spacing: 200,
        spikeCount: 1,
      },
      {
        id: "build",
        type: "mixed",
        startTime: 8000,
        duration: 12000,
        density: 0.25,
        difficulty: 2,
        spacing: 160,
      },
      {
        id: "collect",
        type: "collectibles",
        startTime: 20000,
        duration: 4000,
        density: 0.20,
        difficulty: 1,
        spacing: 120,
        collectibleCount: 6,
      },
      {
        id: "challenge",
        type: "spikes",
        startTime: 24000,
        duration: 12000,
        density: 0.35,
        difficulty: 3,
        spacing: 120,
        spikeCount: 2,
      },
      {
        id: "breather",
        type: "gaps",
        startTime: 36000,
        duration: 4000,
        density: 0.20,
        difficulty: 2,
        spacing: 160,
        gapWidth: 80,
      },
      {
        id: "finale",
        type: "mixed",
        startTime: 40000,
        duration: 8000,
        density: 0.30,
        difficulty: 2,
        spacing: 140,
      },
    ],
    difficultyCurve: [0.10, 0.15, 0.20, 0.25, 0.30, 0.25, 0.20],
    visualTheme: {
      name: "neon_city",
      obstacleColor: "#ff00ff",
      obstacleGlow: "#ff00ff",
      backgroundColor: "#0a0a0a",
      particleColor: "#00ffff",
      specialEffects: ["glow_pulse", "particle_burst"],
    },
    totalDuration: 48000,
    generatedAt: Date.now(),
    version: "premade_1.0",
  },
  {
    trackId: "premade_2",
    patterns: [
      {
        id: "intro",
        type: "blocks",
        startTime: 0,
        duration: 6000,
        density: 0.20,
        difficulty: 1,
        spacing: 180,
        blockWidth: 40,
      },
      {
        id: "rhythm",
        type: "mixed",
        startTime: 6000,
        duration: 10000,
        density: 0.30,
        difficulty: 3,
        spacing: 140,
      },
      {
        id: "collect",
        type: "collectibles",
        startTime: 16000,
        duration: 4000,
        density: 0.25,
        difficulty: 2,
        spacing: 100,
        collectibleCount: 8,
      },
      {
        id: "intense",
        type: "spikes",
        startTime: 20000,
        duration: 14000,
        density: 0.45,
        difficulty: 4,
        spacing: 100,
        spikeCount: 3,
      },
      {
        id: "breather",
        type: "gaps",
        startTime: 34000,
        duration: 6000,
        density: 0.25,
        difficulty: 3,
        spacing: 130,
        gapWidth: 100,
      },
      {
        id: "finale",
        type: "blocks",
        startTime: 40000,
        duration: 8000,
        density: 0.25,
        difficulty: 2,
        spacing: 150,
        blockWidth: 40,
      },
    ],
    difficultyCurve: [0.15, 0.20, 0.30, 0.40, 0.45, 0.30, 0.20],
    visualTheme: {
      name: "retro_arcade",
      obstacleColor: "#ff6b35",
      obstacleGlow: "#ff6b35",
      backgroundColor: "#2d1b69",
      particleColor: "#f7931e",
      specialEffects: ["screen_shake", "glow_pulse"],
    },
    totalDuration: 48000,
    generatedAt: Date.now(),
    version: "premade_2.0",
  },
  {
    trackId: "premade_3",
    patterns: [
      {
        id: "intro",
        type: "spikes",
        startTime: 0,
        duration: 8000,
        density: 0.25,
        difficulty: 2,
        spacing: 140,
        spikeCount: 2,
      },
      {
        id: "build",
        type: "mixed",
        startTime: 8000,
        duration: 12000,
        density: 0.35,
        difficulty: 4,
        spacing: 110,
      },
      {
        id: "collect",
        type: "collectibles",
        startTime: 20000,
        duration: 4000,
        density: 0.20,
        difficulty: 2,
        spacing: 100,
        collectibleCount: 7,
      },
      {
        id: "challenge",
        type: "spikes",
        startTime: 24000,
        duration: 12000,
        density: 0.50,
        difficulty: 5,
        spacing: 85,
        spikeCount: 4,
      },
      {
        id: "breather",
        type: "gaps",
        startTime: 36000,
        duration: 4000,
        density: 0.20,
        difficulty: 3,
        spacing: 120,
        gapWidth: 90,
      },
      {
        id: "finale",
        type: "mixed",
        startTime: 40000,
        duration: 8000,
        density: 0.30,
        difficulty: 3,
        spacing: 130,
      },
    ],
    difficultyCurve: [0.20, 0.25, 0.35, 0.45, 0.50, 0.35, 0.25],
    visualTheme: {
      name: "dark_underground",
      obstacleColor: "#8b0000",
      obstacleGlow: "#8b0000",
      backgroundColor: "#000000",
      particleColor: "#4b0082",
      specialEffects: ["screen_shake", "particle_burst"],
    },
    totalDuration: 48000,
    generatedAt: Date.now(),
    version: "premade_3.0",
  },
  {
    trackId: "premade_4",
    patterns: [
      {
        id: "intro",
        type: "mixed",
        startTime: 0,
        duration: 10000,
        density: 0.30,
        difficulty: 3,
        spacing: 130,
      },
      {
        id: "build",
        type: "spikes",
        startTime: 10000,
        duration: 14000,
        density: 0.40,
        difficulty: 5,
        spacing: 90,
        spikeCount: 4,
      },
      {
        id: "collect",
        type: "collectibles",
        startTime: 24000,
        duration: 4000,
        density: 0.20,
        difficulty: 2,
        spacing: 100,
        collectibleCount: 8,
      },
      {
        id: "intense",
        type: "mixed",
        startTime: 28000,
        duration: 14000,
        density: 0.55,
        difficulty: 6,
        spacing: 85,
      },
      {
        id: "breather",
        type: "gaps",
        startTime: 42000,
        duration: 6000,
        density: 0.30,
        difficulty: 4,
        spacing: 110,
        gapWidth: 100,
      },
      {
        id: "finale",
        type: "spikes",
        startTime: 48000,
        duration: 8000,
        density: 0.25,
        difficulty: 3,
        spacing: 150,
        spikeCount: 1,
      },
    ],
    difficultyCurve: [0.25, 0.30, 0.40, 0.50, 0.55, 0.40, 0.25],
    visualTheme: {
      name: "bright_sky",
      obstacleColor: "#00ff00",
      obstacleGlow: "#00ff00",
      backgroundColor: "#87ceeb",
      particleColor: "#ffff00",
      specialEffects: ["particle_burst", "color_shift"],
    },
    totalDuration: 56000,
    generatedAt: Date.now(),
    version: "premade_4.0",
  },
  {
    trackId: "premade_5",
    patterns: [
      {
        id: "intro",
        type: "blocks",
        startTime: 0,
        duration: 8000,
        density: 0.25,
        difficulty: 3,
        spacing: 120,
        blockWidth: 50,
      },
      {
        id: "rhythm",
        type: "mixed",
        startTime: 8000,
        duration: 12000,
        density: 0.40,
        difficulty: 5,
        spacing: 100,
      },
      {
        id: "collect",
        type: "collectibles",
        startTime: 20000,
        duration: 4000,
        density: 0.25,
        difficulty: 2,
        spacing: 100,
        collectibleCount: 9,
      },
      {
        id: "intense",
        type: "spikes",
        startTime: 24000,
        duration: 14000,
        density: 0.55,
        difficulty: 7,
        spacing: 80,
        spikeCount: 5,
      },
      {
        id: "breather",
        type: "gaps",
        startTime: 38000,
        duration: 6000,
        density: 0.30,
        difficulty: 5,
        spacing: 120,
        gapWidth: 100,
      },
      {
        id: "finale",
        type: "mixed",
        startTime: 44000,
        duration: 8000,
        density: 0.30,
        difficulty: 4,
        spacing: 130,
      },
    ],
    difficultyCurve: [0.25, 0.35, 0.45, 0.55, 0.65, 0.50, 0.35],
    visualTheme: {
      name: "neon_dance",
      obstacleColor: "#ff00ff",
      obstacleGlow: "#00ffff",
      backgroundColor: "#0a0a0a",
      particleColor: "#ff00ff",
      specialEffects: ["glow_pulse", "particle_burst", "color_shift"],
    },
    totalDuration: 52000,
    generatedAt: Date.now(),
    version: "premade_5.0",
  },
];

/**
 * Get a pre-made map for instant fallback.
 * Maps are rotated to provide variety.
 */
export function getPremadeMap(trackId: string): SongMap {
  // Use track ID to consistently select the same map for the same track
  const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % PREMADE_MAPS.length;
  
  const baseMap = PREMADE_MAPS[index];
  
  // Scale the map to match a typical song duration if needed
  const targetDuration = 48000; // 48 seconds typical
  const timeScale = targetDuration / baseMap.totalDuration;
  
  if (Math.abs(timeScale - 1) > 0.1) {
    // Scale patterns if duration differs significantly
    const scaledPatterns = baseMap.patterns.map(pattern => ({
      ...pattern,
      startTime: Math.round(pattern.startTime * timeScale),
      duration: Math.round(pattern.duration * timeScale),
    }));
    
    return {
      ...baseMap,
      trackId: `premade_${trackId}`,
      patterns: scaledPatterns,
      totalDuration: targetDuration,
    };
  }
  
  return {
    ...baseMap,
    trackId: `premade_${trackId}`,
  };
}

/**
 * Get all available pre-made map IDs for debugging.
 */
export function getPremadeMapIds(): string[] {
  return PREMADE_MAPS.map(map => map.trackId);
}
