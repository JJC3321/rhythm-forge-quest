export interface PlaylistMetrics {
  playlistName: string;
  playlistImage: string;
  trackCount: number;
  avgTempo: number;
  avgEnergy: number;
  avgValence: number;
  avgAcousticness: number;
  avgDanceability: number;
  avgLoudness: number;
}

export interface TrackInfo {
  id: string;
  name: string;
  artist: string;
  durationMs: number;
  popularity: number;
  explicit: boolean;
  energy: number;
  tempo: number;
  valence: number;
  danceability: number;
  acousticness: number;
}

export type GameType = "platformer" | "dodge" | "collector" | "runner" | "geodash";

export type AssetShape = "circle" | "diamond" | "triangle" | "star" | "hexagon" | "crescent" | "bolt";

export interface SpriteDescription {
  shape: AssetShape;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  style: "solid" | "outlined" | "gradient" | "neon";
  eyes: boolean;
}

export interface PlatformDescription {
  style: "solid" | "gradient" | "striped" | "glowing";
  primaryColor: string;
  accentColor: string;
}

export interface BackgroundDescription {
  particleColor: string;
  particleShape: AssetShape;
  particleCount: number;
  starfield: boolean;
  ambientColor: string;
}

export interface AssetDescriptions {
  player: SpriteDescription;
  enemies: SpriteDescription[];
  collectible: SpriteDescription;
  platform: PlatformDescription;
  background: BackgroundDescription;
}

export interface GameConfiguration {
  gameType: GameType;
  title: string;
  description: string;
  gravity: number;
  playerSpeed: number;
  spawnRateMs: number;
  difficulty: number; // 1-10
  colorPalette: {
    background: string;
    player: string;
    enemies: string;
    collectibles: string;
    platforms: string;
    accent: string;
  };
  enemyTypes: string[];
  backgroundTheme: string;
  musicInfluence: string; // AI's reasoning
  metrics?: PlaylistMetrics; // Real Spotify audio features
  assets?: AssetDescriptions; // AI-generated visual asset descriptions
  tracks?: TrackInfoWithMap[]; // Per-track data for GeoDash mode with maps
  songMaps?: SongMap[]; // Generated maps for each song
}

export type AppScreen = "landing" | "loading" | "game";

export interface AppState {
  screen: AppScreen;
  playlistUrl: string;
  playlistMetrics: PlaylistMetrics | null;
  gameConfig: GameConfiguration | null;
  score: number;
  isGameOver: boolean;
}

export type LoadingStep = "spotify" | "gemini" | "map-generation" | "assets" | "engine";

// ─── Map Generation Types ───────────────────────────────────────

export type MapPatternType = 'spikes' | 'blocks' | 'gaps' | 'collectibles' | 'mixed';

export type MapCacheStatus = 'pending' | 'generating' | 'ready' | 'failed';

export interface VisualModifier {
  type: 'color_shift' | 'particle_burst' | 'screen_shake' | 'glow_pulse';
  intensity: number; // 0-1
  startTime: number; // ms into pattern
  duration: number; // ms
}

export interface MapPattern {
  id: string;
  type: MapPatternType;
  startTime: number; // ms into song
  duration: number; // ms
  density: number; // 0-1, obstacle frequency
  difficulty: number; // 1-10
  spacing: number; // pixels between obstacles
  visualModifiers?: VisualModifier[];
  // Specific pattern configurations
  spikeCount?: number;
  blockWidth?: number;
  gapWidth?: number;
  collectibleCount?: number;
}

export interface MapTheme {
  name: string;
  obstacleColor: string;
  obstacleGlow: string;
  backgroundColor: string;
  particleColor: string;
  specialEffects: string[];
}

export interface SongMap {
  trackId: string;
  patterns: MapPattern[];
  difficultyCurve: number[]; // difficulty over time (0-1 normalized)
  visualTheme: MapTheme;
  totalDuration: number; // ms
  generatedAt: number;
  version: string;
}

// Extended TrackInfo to include map data
export interface TrackInfoWithMap extends TrackInfo {
  mapConfig?: SongMap;
  mapGenerated: boolean;
  mapCacheStatus: MapCacheStatus;
}
