/**
 * Reference maps based on popular Geometry Dash levels.
 * These serve as playability-proven templates for Gemini to create variations from.
 *
 * Key playability constraints baked into every pattern:
 *  - Minimum spacing ≥ 80px (enough for a jump arc at any scroll speed)
 *  - Spike groups ≤ 5 consecutive (physically jumpable)
 *  - Block heights ≤ 70px (single-jump clearable)
 *  - Gaps are always followed by safe landing zones
 *  - Difficulty ramps gradually — no instant spikes from easy to insane
 */

import { SongMap, MapPattern } from "@/types/game";

// ─── Helper ──────────────────────────────────────────────────────

let _pid = 0;
function pid(): string {
  return `ref_p${_pid++}`;
}

// ─── 1. Stereo Madness (Easy, ~120 BPM, high energy 0.6) ────────

export const stereoMadnessMap: SongMap = {
  trackId: "ref_stereo_madness",
  totalDuration: 92000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.35, 0.3, 0.2],
  visualTheme: {
    name: "neon_bright",
    obstacleColor: "#ff4444",
    obstacleGlow: "#ff6666",
    backgroundColor: "#0a0a2e",
    particleColor: "#44aaff",
    specialEffects: ["glow_pulse"],
  },
  patterns: [
    // Intro — very sparse single spikes, generous spacing
    {
      id: pid(), type: "spikes", startTime: 0, duration: 8000,
      density: 0.15, difficulty: 1, spacing: 200, spikeCount: 1,
    },
    // Build-up — single spikes closer together
    {
      id: pid(), type: "spikes", startTime: 8000, duration: 10000,
      density: 0.25, difficulty: 2, spacing: 160, spikeCount: 2,
    },
    // First blocks appear
    {
      id: pid(), type: "blocks", startTime: 18000, duration: 10000,
      density: 0.25, difficulty: 2, spacing: 150, blockWidth: 40,
    },
    // Mixed section — spikes and blocks alternate
    {
      id: pid(), type: "mixed", startTime: 28000, duration: 12000,
      density: 0.3, difficulty: 3, spacing: 140,
    },
    // Collectible breather
    {
      id: pid(), type: "collectibles", startTime: 40000, duration: 6000,
      density: 0.2, difficulty: 1, spacing: 120, collectibleCount: 6,
    },
    // Mid-song spike run
    {
      id: pid(), type: "spikes", startTime: 46000, duration: 12000,
      density: 0.35, difficulty: 4, spacing: 120, spikeCount: 3,
    },
    // Gap section — short gaps with safe landings
    {
      id: pid(), type: "gaps", startTime: 58000, duration: 8000,
      density: 0.2, difficulty: 3, spacing: 160, gapWidth: 80,
    },
    // Climax mixed
    {
      id: pid(), type: "mixed", startTime: 66000, duration: 14000,
      density: 0.4, difficulty: 4, spacing: 110,
      visualModifiers: [{ type: "glow_pulse", intensity: 0.4, startTime: 0, duration: 14000 }],
    },
    // Cool-down — sparse spikes
    {
      id: pid(), type: "spikes", startTime: 80000, duration: 8000,
      density: 0.15, difficulty: 2, spacing: 200, spikeCount: 1,
    },
    // Outro collectibles
    {
      id: pid(), type: "collectibles", startTime: 88000, duration: 4000,
      density: 0.15, difficulty: 1, spacing: 140, collectibleCount: 4,
    },
  ],
};

// ─── 2. Back On Track (Easy, ~130 BPM, energy 0.55) ─────────────

export const backOnTrackMap: SongMap = {
  trackId: "ref_back_on_track",
  totalDuration: 96000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.1, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.4, 0.3, 0.15],
  visualTheme: {
    name: "warm_digital",
    obstacleColor: "#ff6622",
    obstacleGlow: "#ff8844",
    backgroundColor: "#121228",
    particleColor: "#ffaa44",
    specialEffects: ["warm_glow"],
  },
  patterns: [
    // Intro — blocks only, easy timing
    {
      id: pid(), type: "blocks", startTime: 0, duration: 10000,
      density: 0.15, difficulty: 1, spacing: 200, blockWidth: 35,
    },
    // Single spikes
    {
      id: pid(), type: "spikes", startTime: 10000, duration: 10000,
      density: 0.2, difficulty: 2, spacing: 180, spikeCount: 1,
    },
    // Triple spikes — signature GD pattern
    {
      id: pid(), type: "spikes", startTime: 20000, duration: 12000,
      density: 0.3, difficulty: 3, spacing: 100, spikeCount: 3,
    },
    // Block jumps
    {
      id: pid(), type: "blocks", startTime: 32000, duration: 10000,
      density: 0.3, difficulty: 3, spacing: 140, blockWidth: 45,
    },
    // Mixed section
    {
      id: pid(), type: "mixed", startTime: 42000, duration: 14000,
      density: 0.35, difficulty: 4, spacing: 120,
    },
    // Collectible break
    {
      id: pid(), type: "collectibles", startTime: 56000, duration: 6000,
      density: 0.2, difficulty: 1, spacing: 110, collectibleCount: 8,
    },
    // Spike groups build
    {
      id: pid(), type: "spikes", startTime: 62000, duration: 14000,
      density: 0.4, difficulty: 5, spacing: 100, spikeCount: 4,
      visualModifiers: [{ type: "glow_pulse", intensity: 0.5, startTime: 0, duration: 14000 }],
    },
    // Wind-down gaps
    {
      id: pid(), type: "gaps", startTime: 76000, duration: 10000,
      density: 0.2, difficulty: 3, spacing: 160, gapWidth: 90,
    },
    // Outro
    {
      id: pid(), type: "spikes", startTime: 86000, duration: 10000,
      density: 0.15, difficulty: 2, spacing: 200, spikeCount: 1,
    },
  ],
};

// ─── 3. Polargeist (Normal, ~140 BPM, energy 0.7) ───────────────

export const polargeistMap: SongMap = {
  trackId: "ref_polargeist",
  totalDuration: 108000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.15, 0.25, 0.35, 0.45, 0.5, 0.55, 0.6, 0.55, 0.4, 0.25],
  visualTheme: {
    name: "neon_dark",
    obstacleColor: "#cc22ff",
    obstacleGlow: "#dd66ff",
    backgroundColor: "#0d0d1a",
    particleColor: "#8844ff",
    specialEffects: ["digital_trails", "glow_pulse"],
  },
  patterns: [
    {
      id: pid(), type: "spikes", startTime: 0, duration: 8000,
      density: 0.2, difficulty: 2, spacing: 180, spikeCount: 2,
    },
    {
      id: pid(), type: "mixed", startTime: 8000, duration: 12000,
      density: 0.3, difficulty: 3, spacing: 140,
    },
    // Tighter spike groups — Polargeist's defining feature
    {
      id: pid(), type: "spikes", startTime: 20000, duration: 14000,
      density: 0.4, difficulty: 5, spacing: 90, spikeCount: 4,
    },
    {
      id: pid(), type: "blocks", startTime: 34000, duration: 10000,
      density: 0.35, difficulty: 4, spacing: 120, blockWidth: 50,
    },
    // Collectible reward
    {
      id: pid(), type: "collectibles", startTime: 44000, duration: 6000,
      density: 0.25, difficulty: 2, spacing: 100, collectibleCount: 7,
    },
    // Intense mixed section
    {
      id: pid(), type: "mixed", startTime: 50000, duration: 16000,
      density: 0.45, difficulty: 6, spacing: 100,
      visualModifiers: [
        { type: "color_shift", intensity: 0.5, startTime: 0, duration: 16000 },
        { type: "glow_pulse", intensity: 0.6, startTime: 0, duration: 16000 },
      ],
    },
    // Gap + spike combo
    {
      id: pid(), type: "gaps", startTime: 66000, duration: 10000,
      density: 0.3, difficulty: 5, spacing: 130, gapWidth: 100,
    },
    {
      id: pid(), type: "spikes", startTime: 76000, duration: 14000,
      density: 0.5, difficulty: 6, spacing: 85, spikeCount: 5,
      visualModifiers: [{ type: "screen_shake", intensity: 0.3, startTime: 0, duration: 14000 }],
    },
    // Cool-down
    {
      id: pid(), type: "blocks", startTime: 90000, duration: 10000,
      density: 0.25, difficulty: 3, spacing: 150, blockWidth: 40,
    },
    {
      id: pid(), type: "collectibles", startTime: 100000, duration: 8000,
      density: 0.15, difficulty: 1, spacing: 120, collectibleCount: 5,
    },
  ],
};

// ─── 4. Dry Out (Normal, ~150 BPM, energy 0.75) ─────────────────

export const dryOutMap: SongMap = {
  trackId: "ref_dry_out",
  totalDuration: 100000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.2, 0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.6, 0.45, 0.3],
  visualTheme: {
    name: "intense_neon",
    obstacleColor: "#ff2244",
    obstacleGlow: "#ff4466",
    backgroundColor: "#0a0a18",
    particleColor: "#ff6688",
    specialEffects: ["intense_glow", "digital_trails"],
  },
  patterns: [
    {
      id: pid(), type: "spikes", startTime: 0, duration: 8000,
      density: 0.25, difficulty: 3, spacing: 150, spikeCount: 2,
    },
    {
      id: pid(), type: "mixed", startTime: 8000, duration: 12000,
      density: 0.35, difficulty: 4, spacing: 120,
    },
    // Fast-paced spike run
    {
      id: pid(), type: "spikes", startTime: 20000, duration: 14000,
      density: 0.45, difficulty: 5, spacing: 95, spikeCount: 4,
      visualModifiers: [{ type: "glow_pulse", intensity: 0.5, startTime: 0, duration: 14000 }],
    },
    {
      id: pid(), type: "blocks", startTime: 34000, duration: 8000,
      density: 0.35, difficulty: 4, spacing: 120, blockWidth: 50,
    },
    {
      id: pid(), type: "gaps", startTime: 42000, duration: 8000,
      density: 0.3, difficulty: 5, spacing: 130, gapWidth: 90,
    },
    // Peak intensity mixed
    {
      id: pid(), type: "mixed", startTime: 50000, duration: 16000,
      density: 0.5, difficulty: 6, spacing: 90,
      visualModifiers: [
        { type: "color_shift", intensity: 0.6, startTime: 0, duration: 16000 },
        { type: "screen_shake", intensity: 0.3, startTime: 8000, duration: 8000 },
      ],
    },
    // Dense spikes
    {
      id: pid(), type: "spikes", startTime: 66000, duration: 14000,
      density: 0.5, difficulty: 7, spacing: 85, spikeCount: 5,
    },
    // Collectible breather
    {
      id: pid(), type: "collectibles", startTime: 80000, duration: 6000,
      density: 0.2, difficulty: 2, spacing: 110, collectibleCount: 6,
    },
    // Outro
    {
      id: pid(), type: "mixed", startTime: 86000, duration: 14000,
      density: 0.3, difficulty: 4, spacing: 130,
    },
  ],
};

// ─── 5. Base After Base (Hard, ~145 BPM, energy 0.8) ────────────

export const baseAfterBaseMap: SongMap = {
  trackId: "ref_base_after_base",
  totalDuration: 115000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.2, 0.35, 0.45, 0.55, 0.65, 0.7, 0.75, 0.7, 0.55, 0.35],
  visualTheme: {
    name: "dark_digital",
    obstacleColor: "#22ccff",
    obstacleGlow: "#44ddff",
    backgroundColor: "#050515",
    particleColor: "#2288ff",
    specialEffects: ["intense_glow", "digital_trails", "glow_pulse"],
  },
  patterns: [
    {
      id: pid(), type: "mixed", startTime: 0, duration: 10000,
      density: 0.25, difficulty: 3, spacing: 150,
    },
    {
      id: pid(), type: "spikes", startTime: 10000, duration: 12000,
      density: 0.35, difficulty: 4, spacing: 120, spikeCount: 3,
    },
    // Complex spike formations
    {
      id: pid(), type: "spikes", startTime: 22000, duration: 14000,
      density: 0.5, difficulty: 6, spacing: 85, spikeCount: 5,
      visualModifiers: [{ type: "glow_pulse", intensity: 0.6, startTime: 0, duration: 14000 }],
    },
    // Tight block sections
    {
      id: pid(), type: "blocks", startTime: 36000, duration: 12000,
      density: 0.45, difficulty: 6, spacing: 100, blockWidth: 55,
    },
    {
      id: pid(), type: "collectibles", startTime: 48000, duration: 6000,
      density: 0.25, difficulty: 2, spacing: 100, collectibleCount: 8,
    },
    // Intense mixed run
    {
      id: pid(), type: "mixed", startTime: 54000, duration: 18000,
      density: 0.55, difficulty: 7, spacing: 85,
      visualModifiers: [
        { type: "screen_shake", intensity: 0.4, startTime: 0, duration: 18000 },
        { type: "particle_burst", intensity: 0.7, startTime: 9000, duration: 9000 },
      ],
    },
    // Spike gauntlet
    {
      id: pid(), type: "spikes", startTime: 72000, duration: 16000,
      density: 0.55, difficulty: 8, spacing: 80, spikeCount: 5,
      visualModifiers: [{ type: "color_shift", intensity: 0.7, startTime: 0, duration: 16000 }],
    },
    // Gap challenge
    {
      id: pid(), type: "gaps", startTime: 88000, duration: 10000,
      density: 0.35, difficulty: 6, spacing: 120, gapWidth: 100,
    },
    // Wind-down
    {
      id: pid(), type: "mixed", startTime: 98000, duration: 10000,
      density: 0.3, difficulty: 4, spacing: 130,
    },
    {
      id: pid(), type: "collectibles", startTime: 108000, duration: 7000,
      density: 0.15, difficulty: 1, spacing: 130, collectibleCount: 5,
    },
  ],
};

// ─── 6. Cant Let Go (Hard, ~155 BPM, energy 0.82) ───────────────

export const cantLetGoMap: SongMap = {
  trackId: "ref_cant_let_go",
  totalDuration: 105000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.25, 0.35, 0.5, 0.6, 0.65, 0.7, 0.75, 0.7, 0.5, 0.3],
  visualTheme: {
    name: "neon_intense",
    obstacleColor: "#ff0066",
    obstacleGlow: "#ff3388",
    backgroundColor: "#0a0518",
    particleColor: "#ff44aa",
    specialEffects: ["intense_glow", "glow_pulse"],
  },
  patterns: [
    {
      id: pid(), type: "spikes", startTime: 0, duration: 8000,
      density: 0.3, difficulty: 3, spacing: 140, spikeCount: 2,
    },
    {
      id: pid(), type: "blocks", startTime: 8000, duration: 10000,
      density: 0.35, difficulty: 4, spacing: 120, blockWidth: 45,
    },
    {
      id: pid(), type: "mixed", startTime: 18000, duration: 14000,
      density: 0.45, difficulty: 5, spacing: 110,
    },
    // High-density obstacle flood
    {
      id: pid(), type: "spikes", startTime: 32000, duration: 14000,
      density: 0.55, difficulty: 7, spacing: 85, spikeCount: 5,
      visualModifiers: [{ type: "glow_pulse", intensity: 0.7, startTime: 0, duration: 14000 }],
    },
    {
      id: pid(), type: "collectibles", startTime: 46000, duration: 5000,
      density: 0.2, difficulty: 2, spacing: 100, collectibleCount: 7,
    },
    {
      id: pid(), type: "mixed", startTime: 51000, duration: 18000,
      density: 0.55, difficulty: 7, spacing: 85,
      visualModifiers: [
        { type: "screen_shake", intensity: 0.4, startTime: 0, duration: 18000 },
        { type: "color_shift", intensity: 0.6, startTime: 0, duration: 18000 },
      ],
    },
    // Spike + gap combo
    {
      id: pid(), type: "gaps", startTime: 69000, duration: 10000,
      density: 0.4, difficulty: 6, spacing: 110, gapWidth: 90,
    },
    {
      id: pid(), type: "spikes", startTime: 79000, duration: 12000,
      density: 0.5, difficulty: 7, spacing: 85, spikeCount: 4,
    },
    // Cool-down
    {
      id: pid(), type: "blocks", startTime: 91000, duration: 8000,
      density: 0.25, difficulty: 3, spacing: 150, blockWidth: 40,
    },
    {
      id: pid(), type: "collectibles", startTime: 99000, duration: 6000,
      density: 0.15, difficulty: 1, spacing: 120, collectibleCount: 5,
    },
  ],
};

// ─── 7. Jumper (Harder, ~160 BPM, energy 0.85) ──────────────────

export const jumperMap: SongMap = {
  trackId: "ref_jumper",
  totalDuration: 118000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.75, 0.6, 0.35],
  visualTheme: {
    name: "electric_blue",
    obstacleColor: "#0088ff",
    obstacleGlow: "#44aaff",
    backgroundColor: "#030318",
    particleColor: "#0066cc",
    specialEffects: ["intense_glow", "digital_trails", "glow_pulse"],
  },
  patterns: [
    {
      id: pid(), type: "mixed", startTime: 0, duration: 10000,
      density: 0.3, difficulty: 4, spacing: 130,
    },
    // Extended spike runs
    {
      id: pid(), type: "spikes", startTime: 10000, duration: 16000,
      density: 0.5, difficulty: 6, spacing: 90, spikeCount: 5,
    },
    {
      id: pid(), type: "blocks", startTime: 26000, duration: 10000,
      density: 0.4, difficulty: 5, spacing: 110, blockWidth: 50,
    },
    // Precision jumps
    {
      id: pid(), type: "spikes", startTime: 36000, duration: 16000,
      density: 0.55, difficulty: 7, spacing: 85, spikeCount: 5,
      visualModifiers: [{ type: "glow_pulse", intensity: 0.7, startTime: 0, duration: 16000 }],
    },
    {
      id: pid(), type: "collectibles", startTime: 52000, duration: 6000,
      density: 0.2, difficulty: 2, spacing: 100, collectibleCount: 8,
    },
    // Gap challenge
    {
      id: pid(), type: "gaps", startTime: 58000, duration: 12000,
      density: 0.4, difficulty: 6, spacing: 110, gapWidth: 100,
    },
    // Peak difficulty mixed
    {
      id: pid(), type: "mixed", startTime: 70000, duration: 20000,
      density: 0.6, difficulty: 8, spacing: 80,
      visualModifiers: [
        { type: "screen_shake", intensity: 0.5, startTime: 0, duration: 20000 },
        { type: "particle_burst", intensity: 0.8, startTime: 10000, duration: 10000 },
      ],
    },
    // Dense spike finale
    {
      id: pid(), type: "spikes", startTime: 90000, duration: 14000,
      density: 0.6, difficulty: 8, spacing: 80, spikeCount: 5,
      visualModifiers: [{ type: "color_shift", intensity: 0.8, startTime: 0, duration: 14000 }],
    },
    // Wind-down
    {
      id: pid(), type: "blocks", startTime: 104000, duration: 8000,
      density: 0.25, difficulty: 3, spacing: 150, blockWidth: 40,
    },
    {
      id: pid(), type: "collectibles", startTime: 112000, duration: 6000,
      density: 0.15, difficulty: 1, spacing: 130, collectibleCount: 5,
    },
  ],
};

// ─── 8. Cycles (Harder, ~145 BPM, energy 0.8, high danceability) ─

export const cyclesMap: SongMap = {
  trackId: "ref_cycles",
  totalDuration: 110000,
  generatedAt: 0,
  version: "reference_1.0",
  difficultyCurve: [0.25, 0.35, 0.5, 0.6, 0.7, 0.75, 0.8, 0.7, 0.5, 0.3],
  visualTheme: {
    name: "rhythmic_pulse",
    obstacleColor: "#44ff44",
    obstacleGlow: "#66ff88",
    backgroundColor: "#0a1a0a",
    particleColor: "#22cc44",
    specialEffects: ["glow_pulse", "particle_burst"],
  },
  patterns: [
    {
      id: pid(), type: "spikes", startTime: 0, duration: 10000,
      density: 0.25, difficulty: 3, spacing: 140, spikeCount: 2,
    },
    // Rhythmic mixed — danceability-driven predictable timing
    {
      id: pid(), type: "mixed", startTime: 10000, duration: 14000,
      density: 0.4, difficulty: 5, spacing: 110,
    },
    {
      id: pid(), type: "spikes", startTime: 24000, duration: 14000,
      density: 0.5, difficulty: 6, spacing: 90, spikeCount: 4,
      visualModifiers: [{ type: "glow_pulse", intensity: 0.6, startTime: 0, duration: 14000 }],
    },
    {
      id: pid(), type: "blocks", startTime: 38000, duration: 10000,
      density: 0.4, difficulty: 5, spacing: 110, blockWidth: 50,
    },
    {
      id: pid(), type: "collectibles", startTime: 48000, duration: 6000,
      density: 0.2, difficulty: 2, spacing: 100, collectibleCount: 8,
    },
    // Dense rhythmic section — patterns repeat to match beats
    {
      id: pid(), type: "mixed", startTime: 54000, duration: 18000,
      density: 0.55, difficulty: 7, spacing: 85,
      visualModifiers: [
        { type: "particle_burst", intensity: 0.7, startTime: 0, duration: 18000 },
        { type: "glow_pulse", intensity: 0.7, startTime: 0, duration: 18000 },
      ],
    },
    {
      id: pid(), type: "spikes", startTime: 72000, duration: 14000,
      density: 0.55, difficulty: 8, spacing: 80, spikeCount: 5,
      visualModifiers: [{ type: "screen_shake", intensity: 0.4, startTime: 0, duration: 14000 }],
    },
    {
      id: pid(), type: "gaps", startTime: 86000, duration: 8000,
      density: 0.3, difficulty: 5, spacing: 120, gapWidth: 90,
    },
    {
      id: pid(), type: "mixed", startTime: 94000, duration: 10000,
      density: 0.3, difficulty: 4, spacing: 130,
    },
    {
      id: pid(), type: "collectibles", startTime: 104000, duration: 6000,
      density: 0.15, difficulty: 1, spacing: 120, collectibleCount: 5,
    },
  ],
};

// ─── All reference maps ─────────────────────────────────────────

export const referenceMaps: SongMap[] = [
  stereoMadnessMap,
  backOnTrackMap,
  polargeistMap,
  dryOutMap,
  baseAfterBaseMap,
  cantLetGoMap,
  jumperMap,
  cyclesMap,
];

/**
 * Select the best reference map for a given track based on energy + tempo.
 * Returns the closest match so Gemini can generate a variation of it.
 */
export function selectReferenceMap(energy: number, tempo: number, danceability: number): SongMap {
  const targets: { map: SongMap; energy: number; tempo: number; dance: number }[] = [
    { map: stereoMadnessMap, energy: 0.6, tempo: 120, dance: 0.5 },
    { map: backOnTrackMap, energy: 0.55, tempo: 130, dance: 0.5 },
    { map: polargeistMap, energy: 0.7, tempo: 140, dance: 0.6 },
    { map: dryOutMap, energy: 0.75, tempo: 150, dance: 0.6 },
    { map: baseAfterBaseMap, energy: 0.8, tempo: 145, dance: 0.65 },
    { map: cantLetGoMap, energy: 0.82, tempo: 155, dance: 0.7 },
    { map: jumperMap, energy: 0.85, tempo: 160, dance: 0.7 },
    { map: cyclesMap, energy: 0.8, tempo: 145, dance: 0.85 },
  ];

  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const dist =
      Math.abs(t.energy - energy) * 2 +
      Math.abs((t.tempo - tempo) / 200) +
      Math.abs(t.dance - danceability);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return targets[bestIdx].map;
}

/**
 * Serialize a reference map into a compact text block for an LLM prompt.
 */
export function serializeMapForPrompt(map: SongMap): string {
  const lines: string[] = [];
  lines.push(`Reference level: "${map.visualTheme.name}" | duration ${map.totalDuration}ms`);
  lines.push(`Difficulty curve: [${map.difficultyCurve.map(d => d.toFixed(2)).join(", ")}]`);
  lines.push(`Patterns (${map.patterns.length}):`);
  for (const p of map.patterns) {
    let detail = `  ${p.type.padEnd(13)} t=${p.startTime}-${p.startTime + p.duration}ms  density=${p.density}  diff=${p.difficulty}  spacing=${p.spacing}`;
    if (p.spikeCount) detail += `  spikes=${p.spikeCount}`;
    if (p.blockWidth) detail += `  blockW=${p.blockWidth}`;
    if (p.gapWidth) detail += `  gapW=${p.gapWidth}`;
    if (p.collectibleCount) detail += `  coins=${p.collectibleCount}`;
    lines.push(detail);
  }
  return lines.join("\n");
}

/**
 * Playability constraints that must hold for every generated map.
 * This text is injected into the Gemini prompt so the AI respects them.
 */
export const PLAYABILITY_RULES = `
CRITICAL PLAYABILITY RULES — every pattern MUST satisfy these or the level is unbeatable:
1. spacing ≥ 80px — minimum gap between any two obstacles so the player can physically jump over them
2. spikeCount ≤ 5 per pattern — more consecutive spikes than this cannot be jumped over in one leap
3. blockWidth ≤ 70px — taller blocks need lower widths; blocks exceeding 70px are unjumpable
4. gapWidth between 60-120px — gaps below 60 feel like nothing, above 120 are impossible to cross
5. density ≤ 0.7 at absolute maximum — even the hardest GD levels never exceed this; 0.6 is a safe peak
6. Every 3-5 obstacle patterns MUST be followed by either a 'gaps' or 'collectibles' breather pattern (density ≤ 0.25, duration ≥ 4000ms) — this lets the player recover
7. Difficulty must ramp gradually: never jump more than +2 difficulty between consecutive patterns
8. The first pattern should always be difficulty ≤ 3 to give the player time to react
9. The last pattern should always be difficulty ≤ 3 (cool-down / outro)
10. Total pattern count should be 8-12 for a typical song length
`.trim();
