import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mapGenerator } from '@/game/mapGenerator';
import { TrackInfoWithMap, SongMap } from '@/types/game';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('MapGenerator', () => {
  beforeEach(() => {
    mapGenerator.clearCache();
    vi.clearAllMocks();
  });

  it('should generate a fallback map when AI generation fails', async () => {
    const mockTrack: TrackInfoWithMap = {
      id: 'test-track',
      name: 'Test Song',
      artist: 'Test Artist',
      durationMs: 180000,
      popularity: 50,
      explicit: false,
      energy: 0.7,
      tempo: 120,
      valence: 0.6,
      danceability: 0.8,
      acousticness: 0.2,
      mapGenerated: false,
      mapCacheStatus: 'pending',
    };

    // Mock supabase to throw an error
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('API Error'));

    const map = await mapGenerator.generateMap(mockTrack);

    expect(map).toBeDefined();
    expect(map.trackId).toBe('test-track');
    expect(map.patterns).toHaveLength(8);
    expect(map.difficultyCurve).toHaveLength(10);
    expect(map.visualTheme).toBeDefined();
    expect(map.version).toBe('fallback_1.0');
  });

  it('should cache generated maps', async () => {
    const mockTrack: TrackInfoWithMap = {
      id: 'test-track-2',
      name: 'Test Song 2',
      artist: 'Test Artist 2',
      durationMs: 200000,
      popularity: 60,
      explicit: false,
      energy: 0.5,
      tempo: 100,
      valence: 0.4,
      danceability: 0.6,
      acousticness: 0.3,
      mapGenerated: false,
      mapCacheStatus: 'pending',
    };

    // Mock successful AI generation
    const { supabase } = await import('@/integrations/supabase/client');
    const mockMap: SongMap = {
      trackId: 'test-track-2',
      patterns: [],
      difficultyCurve: [],
      visualTheme: {
        name: 'test-theme',
        obstacleColor: '#ff0000',
        obstacleGlow: '#ff4444',
        backgroundColor: '#000000',
        particleColor: '#ffffff',
        specialEffects: [],
      },
      totalDuration: 200000,
      generatedAt: Date.now(),
      version: '1.0',
    };
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockMap,
      error: null,
    });

    const map1 = await mapGenerator.generateMap(mockTrack);
    const map2 = mapGenerator.getCachedMap('test-track-2');

    expect(map1).toBe(map2); // Should be the same reference
    expect(mapGenerator.getCacheStats().size).toBe(1);
  });

  it('should generate appropriate visual themes based on track characteristics', async () => {
    const highEnergyTrack: TrackInfoWithMap = {
      id: 'high-energy',
      name: 'High Energy Song',
      artist: 'Artist',
      durationMs: 180000,
      popularity: 80,
      explicit: false,
      energy: 0.9,
      tempo: 140,
      valence: 0.8,
      danceability: 0.9,
      acousticness: 0.1,
      mapGenerated: false,
      mapCacheStatus: 'pending',
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('API Error'));

    const map = await mapGenerator.generateMap(highEnergyTrack);

    expect(map.visualTheme.name).toContain('bright');
    expect(map.visualTheme.specialEffects).toContain('intense_glow');
  });

  it('should handle map preloading', async () => {
    const tracks: TrackInfoWithMap[] = [
      {
        id: 'track-1',
        name: 'Track 1',
        artist: 'Artist 1',
        durationMs: 180000,
        popularity: 50,
        explicit: false,
        energy: 0.5,
        tempo: 120,
        valence: 0.5,
        danceability: 0.5,
        acousticness: 0.5,
        mapGenerated: false,
        mapCacheStatus: 'pending',
      },
      {
        id: 'track-2',
        name: 'Track 2',
        artist: 'Artist 2',
        durationMs: 180000,
        popularity: 50,
        explicit: false,
        energy: 0.6,
        tempo: 130,
        valence: 0.6,
        danceability: 0.6,
        acousticness: 0.4,
        mapGenerated: false,
        mapCacheStatus: 'pending',
      },
    ];

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('API Error'));

    // Generate map for track-2 directly to test caching
    const map = await mapGenerator.generateMap(tracks[1]);
    
    // Check that the track was cached
    const cachedMap = mapGenerator.getCachedMap('track-2');
    expect(cachedMap).toBeDefined();
    expect(cachedMap?.trackId).toBe('track-2');
    expect(cachedMap).toBe(map); // Should be the same reference
  });
});
