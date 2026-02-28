import { supabase } from "@/integrations/supabase/client";
import { TrackInfoWithMap, SongMap, MapCacheStatus } from "@/types/game";
import { selectReferenceMap } from "@/game/referenceMaps";
import { getPremadeMap } from "@/game/premadeMaps";

interface MapCache {
  [trackId: string]: {
    map: SongMap;
    status: MapCacheStatus;
    generatedAt: number;
  };
}

export class MapGenerator {
  private cache: MapCache = {};
  private maxCacheSize = 10;
  private preloadPromise: Promise<void> | null = null;

  constructor() {
    // Clean up old cache entries periodically
    setInterval(() => this.cleanupCache(), 60000); // Every minute
  }

  /**
   * Generate a map for a specific track using Gemini AI
   */
  async generateMap(track: TrackInfoWithMap): Promise<SongMap> {
    // Validate track data
    if (!track || !track.id || !track.name || !track.artist) {
      const errorDetails = track ? JSON.stringify(track) : 'null track';
      console.error(`Failed to generate map for Unknown Track: ${errorDetails}`);
      throw new Error("Invalid track data: missing required fields (id, name, artist)");
    }

    console.log(`Generating map for track: ${track.name} by ${track.artist}`);
    
    try {
      const { data, error } = await supabase.functions.invoke("gemini-generate-map", {
        body: { track },
      });

      if (error || !data) {
        throw new Error(error?.message || "Failed to generate map");
      }

      const songMap = data as SongMap;
      this.cacheMap(track.id, songMap);
      
      console.log(`Successfully generated map for ${track.name}`);
      return songMap;
    } catch (error) {
      console.error(`Failed to generate map for ${track.name}:`, error);
      // Return a fallback procedural map and cache it
      const fallbackMap = this.generateFallbackMap(track);
      this.cacheMap(track.id, fallbackMap);
      return fallbackMap;
    }
  }

  /**
   * Cache a generated map
   */
  cacheMap(trackId: string, map: SongMap): void {
    // Remove oldest entry if cache is full
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      const oldestKey = Object.keys(this.cache).reduce((oldest, key) => 
        this.cache[key].generatedAt < this.cache[oldest].generatedAt ? key : oldest
      );
      delete this.cache[oldestKey];
    }

    this.cache[trackId] = {
      map,
      status: 'ready',
      generatedAt: Date.now(),
    };
  }

  /**
   * Get a cached map if available
   */
  getCachedMap(trackId: string): SongMap | null {
    const cached = this.cache[trackId];
    if (cached && cached.status === 'ready') {
      return cached.map;
    }
    return null;
  }

  /**
   * Check if a map is currently being generated
   */
  isGenerating(trackId: string): boolean {
    const cached = this.cache[trackId];
    return cached?.status === 'generating' || false;
  }

  /**
   * Preload the next song's map during gameplay
   */
  async preloadNextMap(currentTrackIndex: number, tracks: TrackInfoWithMap[]): Promise<void> {
    if (this.preloadPromise) {
      await this.preloadPromise; // Already preloading
      return;
    }

    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    
    if (!nextTrack || this.getCachedMap(nextTrack.id) || this.isGenerating(nextTrack.id)) {
      return; // Already cached or being generated
    }

    console.log(`Starting preload of next map: ${nextTrack.name}`);
    
    this.preloadPromise = this.generateMap(nextTrack).then(() => {
      // Map is now cached
    }).finally(() => {
      this.preloadPromise = null;
    });

    await this.preloadPromise;
  }

  /**
   * Generate a fallback map when AI generation fails.
   * Uses pre-made maps for instant availability and variety.
   */
  private generateFallbackMap(track: TrackInfoWithMap): SongMap {
    console.log(`Using pre-made fallback map for ${track.name}`);
    return getPremadeMap(track.id);
  }

  /**
   * Generate a visual theme based on track characteristics
   */
  private generateVisualTheme(track: TrackInfoWithMap) {
    // Use safe defaults for missing properties
    const { energy = 0.5, valence = 0.5, acousticness = 0.5 } = track;
    
    let obstacleColor = "#ff4444";
    let obstacleGlow = "#ff6666";
    let backgroundColor = "#1a1a2e";
    let particleColor = "#ffffff";
    let specialEffects: string[] = [];

    // Adjust colors based on valence (happiness)
    if (valence > 0.7) {
      // Happy/bright colors
      obstacleColor = "#44ff44";
      obstacleGlow = "#66ff66";
      particleColor = "#ffff44";
      specialEffects.push("sparkles");
    } else if (valence < 0.3) {
      // Dark/sad colors
      obstacleColor = "#ff0066";
      obstacleGlow = "#ff3388";
      particleColor = "#666699";
      specialEffects.push("mist");
    }

    // Adjust based on acousticness
    if (acousticness > 0.6) {
      // Acoustic - warmer colors
      obstacleColor = "#ff8844";
      obstacleGlow = "#ffaa66";
      backgroundColor = "#2e1a1a";
      specialEffects.push("warm_glow");
    } else if (acousticness < 0.2) {
      // Electronic - cooler colors
      obstacleColor = "#4444ff";
      obstacleGlow = "#6666ff";
      backgroundColor = "#0a0a1e";
      specialEffects.push("digital_trails");
    }

    // High energy effects
    if (energy > 0.7) {
      specialEffects.push("intense_glow");
    }

    return {
      name: `${valence > 0.5 ? 'bright' : 'dark'}_${acousticness > 0.5 ? 'organic' : 'digital'}`,
      obstacleColor,
      obstacleGlow,
      backgroundColor,
      particleColor,
      specialEffects,
    };
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].generatedAt > maxAge) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Clear all cached maps
   */
  clearCache(): void {
    this.cache = {};
    this.preloadPromise = null;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: Object.keys(this.cache).length,
      maxSize: this.maxCacheSize,
      entries: Object.entries(this.cache).map(([id, data]) => ({
        trackId: id,
        status: data.status,
        age: Date.now() - data.generatedAt,
      })),
    };
  }
}

// Singleton instance
export const mapGenerator = new MapGenerator();
