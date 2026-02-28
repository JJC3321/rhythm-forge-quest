import * as ex from "excalibur";
import { GameConfiguration, TrackInfoWithMap, AssetDescriptions, SongMap, MapPattern, TrackInfo } from "@/types/game";
import {
  renderPlatform,
  renderSpike,
  renderBlock,
  renderGeoDashPlayer,
  renderSprite,
  addBackgroundParticles,
  getDefaultAssets,
} from "@/game/assets";
import { mapGenerator } from "./mapGenerator";
import { preloadGDAssets } from "@/game/geometryDashAssets";
import { getPremadeMap } from "@/game/premadeMaps";

// ─── Types ───────────────────────────────────────────────────────

interface GameCallbacks {
  onScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onSongChange?: (track: TrackInfo, index: number) => void;
}

interface TrackParams {
  scrollSpeed: number;
  gravity: number;
  jumpForce: number;
  spikeChance: number;
  blockChance: number;
  gapChance: number;
  doubleChance: number;
  spawnInterval: number;
  obstacleColor: string;
  obstacleGlow: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

function getAssets(config: GameConfiguration): AssetDescriptions {
  return config.assets || getDefaultAssets(config.colorPalette);
}

function trackToParams(track: TrackInfo, config: GameConfiguration): TrackParams {
  const energy = track.energy;
  const tempo = track.tempo;
  const valence = track.valence;
  const dance = track.danceability;
  const acoustic = track.acousticness;

  const baseSpeed = config.playerSpeed || 250;
  const scrollSpeed = baseSpeed * (0.6 + energy * 0.6) * (tempo / 120);
  const gravity = 1800 * config.gravity * (1.1 - acoustic * 0.5);
  const jumpForce = -900 - energy * 200;

  const spikeChance = 0.3 + energy * 0.4;
  const blockChance = 0.15 + (1 - valence) * 0.25;
  const gapChance = 0.1 + energy * 0.2;
  const doubleChance = energy > 0.6 ? 0.15 + (energy - 0.6) * 0.5 : 0;

  const beatMs = 60000 / tempo;
  const spawnInterval = Math.max(400, beatMs * (dance > 0.6 ? 1.0 : 1.5 - energy * 0.5));

  const obstacleColor = config.colorPalette.enemies;
  const obstacleGlow = config.colorPalette.accent;

  return {
    scrollSpeed: Math.max(150, Math.min(500, scrollSpeed)),
    gravity: Math.max(800, Math.min(2800, gravity)),
    jumpForce: Math.max(-1400, Math.min(-600, jumpForce)),
    spikeChance,
    blockChance,
    gapChance,
    doubleChance,
    spawnInterval: Math.max(500, Math.min(2000, spawnInterval)),
    obstacleColor,
    obstacleGlow,
  };
}

function defaultTrack(): TrackInfo {
  return {
    id: "default",
    name: "Unknown Track",
    artist: "Unknown",
    durationMs: 180000,
    popularity: 50,
    explicit: false,
    energy: 0.5,
    tempo: 120,
    valence: 0.5,
    danceability: 0.5,
    acousticness: 0.3,
  };
}

function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const ca = parse(a);
  const cb = parse(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

// ─── Main entry ──────────────────────────────────────────────────

export function createGame(
  canvas: HTMLCanvasElement,
  config: GameConfiguration,
  callbacks: GameCallbacks
): ex.Engine {
  const engine = new ex.Engine({
    canvasElement: canvas,
    width: canvas.clientWidth || 800,
    height: canvas.clientHeight || 600,
    backgroundColor: ex.Color.fromHex(config.colorPalette.background),
    suppressPlayButton: true,
    fixedUpdateFps: 60,
  });

  let score = 0;
  const addScore = (points: number) => {
    score += points;
    callbacks.onScore(score);
  };
  const gameOver = () => {
    callbacks.onGameOver(score);
  };

  // Preload GD assets, then set up the game.
  // If preloading fails the render functions fall back to procedural drawing.
  preloadGDAssets()
    .catch((err) => console.warn("[GD Assets] preload error (using fallbacks):", err))
    .finally(() => {
      setupGeoDash(engine, config, addScore, gameOver, callbacks);
    });

  return engine;
}

// ─── Geometry Dash Auto-Runner ───────────────────────────────────

function setupGeoDash(
  engine: ex.Engine,
  config: GameConfiguration,
  addScore: (n: number) => void,
  gameOver: () => void,
  callbacks: GameCallbacks
) {
  const scene = new ex.Scene();
  engine.addScene("main", scene);
  engine.goToScene("main");

  const assets = getAssets(config);
  const W = engine.drawWidth;
  const H = engine.drawHeight;
  const GROUND_H = 24;
  const GROUND_Y = H - GROUND_H / 2;
  const PLAYER_SIZE = 32;
  const PLAYER_X = 120;

  // ── Track management with map support ──
  const tracks: TrackInfoWithMap[] =
    config.tracks && config.tracks.length > 0 ? config.tracks : [defaultTrack() as TrackInfoWithMap];
  let currentTrackIndex = 0;
  let trackElapsedMs = 0;
  let params = trackToParams(tracks[0], config);
  let nextParams: TrackParams | null = null;
  let transitioning = false;
  let transitionProgress = 0;
  const TRANSITION_MS = 2000;
  
  // Map generation state
  let currentMap: SongMap | null = null;
  let currentPatternIndex = 0;
  let patternProgress = 0;
  let mapBasedSpawning = false;
  let preloadStarted = false;

  function switchToTrack(index: number) {
    if (index >= tracks.length) index = 0;
    currentTrackIndex = index;
    trackElapsedMs = 0;
    const track = tracks[currentTrackIndex];
    nextParams = trackToParams(track, config);
    transitioning = true;
    transitionProgress = 0;
    
    // Load map for new track (async with fallback)
    loadTrackMapWithFallback(track);
    
    if (callbacks.onSongChange) {
      callbacks.onSongChange(track, currentTrackIndex);
    }
  }

  function loadTrackMapWithFallback(track: TrackInfoWithMap) {
    // Validate track data before processing
    if (!track || !track.id || !track.name) {
      console.error(`Failed to load track map: Invalid track data`, track);
      mapBasedSpawning = false;
      return;
    }

    // Try to get cached map first
    let map = mapGenerator.getCachedMap(track.id);
    
    if (map) {
      // Use cached map immediately
      currentMap = map;
      currentPatternIndex = 0;
      patternProgress = 0;
      mapBasedSpawning = true;
      console.log(`Loaded cached map for ${track.name} with ${map.patterns.length} patterns`);
      return;
    }

    // Load pre-made map instantly for immediate gameplay
    const fallbackMap = getPremadeMap(track.id);
    currentMap = fallbackMap;
    currentPatternIndex = 0;
    patternProgress = 0;
    mapBasedSpawning = true;
    console.log(`Loaded pre-made map for ${track.name} (fallback) with ${fallbackMap.patterns.length} patterns`);

    // Generate real map in background and replace when ready
    mapGenerator.generateMap(track)
      .then(realMap => {
        // Only replace if we're still on the same track
        if (currentTrackIndex < tracks.length && tracks[currentTrackIndex].id === track.id) {
          currentMap = realMap;
          currentPatternIndex = 0;
          patternProgress = 0;
          mapBasedSpawning = true;
          console.log(`Upgraded to generated map for ${track.name} with ${realMap.patterns.length} patterns`);
        }
      })
      .catch(error => {
        console.warn(`Failed to generate map for ${track.name}, keeping pre-made fallback:`, error);
      });
  }

  function getCurrentPattern(): MapPattern | null {
    if (!currentMap || !mapBasedSpawning) return null;
    
    const patterns = currentMap.patterns;
    if (currentPatternIndex >= patterns.length) return null;
    
    const currentPattern = patterns[currentPatternIndex];
    const patternEndTime = currentPattern.startTime + currentPattern.duration;
    
    // Check if we should move to next pattern
    if (trackElapsedMs >= patternEndTime) {
      currentPatternIndex++;
      patternProgress = 0;
      if (currentPatternIndex >= patterns.length) {
        return null; // No more patterns
      }
      return getCurrentPattern(); // Recurse to get next pattern
    }
    
    // Update pattern progress
    patternProgress = (trackElapsedMs - currentPattern.startTime) / currentPattern.duration;
    
    return currentPattern;
  }

  function shouldSpawnFromPattern(): boolean {
    const pattern = getCurrentPattern();
    if (!pattern) return false;
    
    // Use pattern density to determine spawn probability
    const spawnChance = pattern.density * 0.1; // Scale down to reasonable rate
    return Math.random() < spawnChance;
  }

  function currentParams(): TrackParams {
    if (!transitioning || !nextParams) return params;
    const t = Math.min(1, transitionProgress);
    return {
      scrollSpeed: params.scrollSpeed + (nextParams.scrollSpeed - params.scrollSpeed) * t,
      gravity: params.gravity + (nextParams.gravity - params.gravity) * t,
      jumpForce: params.jumpForce + (nextParams.jumpForce - params.jumpForce) * t,
      spikeChance: params.spikeChance + (nextParams.spikeChance - params.spikeChance) * t,
      blockChance: params.blockChance + (nextParams.blockChance - params.blockChance) * t,
      gapChance: params.gapChance + (nextParams.gapChance - params.gapChance) * t,
      doubleChance: params.doubleChance + (nextParams.doubleChance - params.doubleChance) * t,
      spawnInterval: params.spawnInterval + (nextParams.spawnInterval - params.spawnInterval) * t,
      obstacleColor: lerpColor(params.obstacleColor, nextParams.obstacleColor, t),
      obstacleGlow: lerpColor(params.obstacleGlow, nextParams.obstacleGlow, t),
    };
  }

  // Notify UI of first track
  if (callbacks.onSongChange) {
    callbacks.onSongChange(tracks[0], 0);
  }

  // Initialize first track's map
  loadTrackMapWithFallback(tracks[0]);

  // ── Background visuals ──
  const bpm = config.metrics?.avgTempo || 120;
  addBackgroundParticles(engine, scene, assets.background, bpm);

  // Beat pulse overlay
  const beatMs = 60000 / bpm;
  const pulseOverlay = new ex.Actor({
    x: W / 2, y: H / 2, width: W, height: H,
    color: ex.Color.fromHex(config.colorPalette.accent),
    z: -10,
  });
  pulseOverlay.graphics.opacity = 0;
  scene.add(pulseOverlay);

  const pulseTimer = new ex.Timer({
    fcn: () => {
      const energy = tracks[currentTrackIndex]?.energy || 0.5;
      pulseOverlay.graphics.opacity = 0.03 + energy * 0.05;
      pulseOverlay.actions.fade(0, beatMs * 0.8);
    },
    interval: beatMs,
    repeats: true,
  });
  scene.add(pulseTimer);
  pulseTimer.start();

  // ── Ground (scrolling segments) ──
  const groundSegments: ex.Actor[] = [];
  const SEG_W = W + 200;
  for (let i = 0; i < 3; i++) {
    const gfx = renderPlatform(assets.platform, SEG_W, GROUND_H);
    const seg = new ex.Actor({
      x: i * SEG_W,
      y: GROUND_Y,
      width: SEG_W,
      height: GROUND_H,
      collisionType: ex.CollisionType.Fixed,
      anchor: ex.vec(0, 0.5),
    });
    seg.graphics.use(gfx);
    scene.add(seg);
    groundSegments.push(seg);
  }

  // ── Player cube ──
  const playerColor = config.colorPalette.player || "#00ff88";
  const playerGlow = config.colorPalette.accent || "#00ffaa";
  const hasEyes = assets.player?.eyes ?? true;
  const playerGfx = renderGeoDashPlayer(playerColor, playerGlow, PLAYER_SIZE, hasEyes);

  const player = new ex.Actor({
    x: PLAYER_X,
    y: GROUND_Y - GROUND_H / 2 - PLAYER_SIZE / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    collisionType: ex.CollisionType.Active,
  });
  player.graphics.use(playerGfx);
  scene.add(player);

  let isGrounded = true;
  let isDead = false;

  player.on("postcollision", (evt) => {
    if (isDead) return;
    if (evt.side === ex.Side.Bottom) {
      isGrounded = true;
      player.vel.y = 0;
      player.rotation = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
      player.angularVelocity = 0;
    }
  });

  // ── Obstacle pool ──
  const obstacles: ex.Actor[] = [];
  let spawnAccumulator = 0;
  let lastSpawnX = W + 100;

  function spawnObstacle() {
    const cp = currentParams();
    const pattern = getCurrentPattern();
    
    // If we have a map pattern, use it to determine obstacle type
    if (pattern && mapBasedSpawning) {
      spawnObstacleFromPattern(pattern, cp);
      return;
    }
    
    // Fallback to random spawning
    const rand = Math.random();
    let totalChance = cp.spikeChance + cp.blockChance;
    let type: "spike" | "block" | "doubleSpike";

    if (rand < cp.spikeChance / totalChance * (1 - cp.doubleChance)) {
      type = "spike";
    } else if (rand < (cp.spikeChance + cp.blockChance * 0.5) / totalChance) {
      type = "block";
    } else if (Math.random() < cp.doubleChance) {
      type = "doubleSpike";
    } else {
      type = "spike";
    }

    const spikeSize = 30 + Math.random() * 10;
    const blockW = 30 + Math.random() * 20;
    const blockH = 30 + Math.random() * 40;

    let obs: ex.Actor;

    switch (type) {
      case "spike": {
        const gfx = renderSpike(cp.obstacleColor, cp.obstacleGlow, spikeSize);
        obs = new ex.Actor({
          x: W + 60,
          y: GROUND_Y - GROUND_H / 2 - spikeSize / 2,
          width: spikeSize * 0.7,
          height: spikeSize * 0.8,
          collisionType: ex.CollisionType.Passive,
        });
        obs.graphics.use(gfx);
        break;
      }
      case "doubleSpike": {
        const gfx = renderSpike(cp.obstacleColor, cp.obstacleGlow, spikeSize);
        obs = new ex.Actor({
          x: W + 60,
          y: GROUND_Y - GROUND_H / 2 - spikeSize / 2,
          width: spikeSize * 0.7,
          height: spikeSize * 0.8,
          collisionType: ex.CollisionType.Passive,
        });
        obs.graphics.use(gfx);
        // Second spike slightly offset
        const gfx2 = renderSpike(cp.obstacleColor, cp.obstacleGlow, spikeSize * 0.8);
        const spike2 = new ex.Actor({
          x: W + 60 + spikeSize * 0.6,
          y: GROUND_Y - GROUND_H / 2 - spikeSize * 0.4,
          width: spikeSize * 0.55,
          height: spikeSize * 0.65,
          collisionType: ex.CollisionType.Passive,
        });
        spike2.graphics.use(gfx2);
        spike2.on("collisionstart", (evt) => {
          if (evt.other.owner === player && !isDead) {
            isDead = true;
            deathEffect();
          }
        });
        scene.add(spike2);
        obstacles.push(spike2);
        break;
      }
      case "block": {
        const gfx = renderBlock(cp.obstacleColor, cp.obstacleGlow, blockW, blockH);
        obs = new ex.Actor({
          x: W + 60,
          y: GROUND_Y - GROUND_H / 2 - blockH / 2,
          width: blockW,
          height: blockH,
          collisionType: ex.CollisionType.Passive,
        });
        obs.graphics.use(gfx);
        break;
      }
    }

    obs.on("collisionstart", (evt) => {
      if (evt.other.owner === player && !isDead) {
        isDead = true;
        deathEffect();
      }
    });

    scene.add(obs);
    obstacles.push(obs);
  }

  function spawnObstacleFromPattern(pattern: MapPattern, cp: TrackParams) {
    // Use pattern-specific colors if available
    const obstacleColor = currentMap?.visualTheme.obstacleColor || cp.obstacleColor;
    const obstacleGlow = currentMap?.visualTheme.obstacleGlow || cp.obstacleGlow;
    
    let obs: ex.Actor;

    switch (pattern.type) {
      case "spikes": {
        const spikeCount = pattern.spikeCount || Math.round(3 + pattern.density * 5);
        const spikeSize = 30 + Math.random() * 10;
        
        for (let i = 0; i < spikeCount; i++) {
          const gfx = renderSpike(obstacleColor, obstacleGlow, spikeSize);
          const spike = new ex.Actor({
            x: W + 60 + i * pattern.spacing,
            y: GROUND_Y - GROUND_H / 2 - spikeSize / 2,
            width: spikeSize * 0.7,
            height: spikeSize * 0.8,
            collisionType: ex.CollisionType.Passive,
          });
          spike.graphics.use(gfx);
          spike.on("collisionstart", (evt) => {
            if (evt.other.owner === player && !isDead) {
              isDead = true;
              deathEffect();
            }
          });
          scene.add(spike);
          obstacles.push(spike);
        }
        return;
      }
      case "blocks": {
        const blockWidth = pattern.blockWidth || 40;
        const blockHeight = 30 + Math.random() * 20;
        const gfx = renderBlock(obstacleColor, obstacleGlow, blockWidth, blockHeight);
        obs = new ex.Actor({
          x: W + 60,
          y: GROUND_Y - GROUND_H / 2 - blockHeight / 2,
          width: blockWidth,
          height: blockHeight,
          collisionType: ex.CollisionType.Passive,
        });
        obs.graphics.use(gfx);
        break;
      }
      case "gaps": {
        // Gaps are handled by not spawning obstacles for a duration
        return;
      }
      case "collectibles": {
        const collectCount = pattern.collectibleCount || Math.round(5 + pattern.density * 5);
        for (let i = 0; i < collectCount; i++) {
          const collectGfx = renderSprite(assets.collectible, 16);
          const col = new ex.Actor({
            x: W + 80 + i * pattern.spacing,
            y: GROUND_Y - GROUND_H / 2 - 60 - Math.random() * 80,
            width: 16,
            height: 16,
            collisionType: ex.CollisionType.Passive,
          });
          col.graphics.use(collectGfx);
          col.angularVelocity = 2;
          col.on("collisionstart", (evt) => {
            if (evt.other.owner === player) {
              addScore(10);
              col.kill();
            }
          });
          scene.add(col);
          obstacles.push(col);
        }
        return;
      }
      case "mixed": {
        // Randomly choose between spikes and blocks
        if (Math.random() < 0.6) {
          const spikeSize = 30 + Math.random() * 10;
          const gfx = renderSpike(obstacleColor, obstacleGlow, spikeSize);
          obs = new ex.Actor({
            x: W + 60,
            y: GROUND_Y - GROUND_H / 2 - spikeSize / 2,
            width: spikeSize * 0.7,
            height: spikeSize * 0.8,
            collisionType: ex.CollisionType.Passive,
          });
          obs.graphics.use(gfx);
        } else {
          const blockWidth = 30 + Math.random() * 20;
          const blockHeight = 30 + Math.random() * 40;
          const gfx = renderBlock(obstacleColor, obstacleGlow, blockWidth, blockHeight);
          obs = new ex.Actor({
            x: W + 60,
            y: GROUND_Y - GROUND_H / 2 - blockHeight / 2,
            width: blockWidth,
            height: blockHeight,
            collisionType: ex.CollisionType.Passive,
          });
          obs.graphics.use(gfx);
        }
        break;
      }
      default: {
        // Fallback to spike
        const spikeSize = 30 + Math.random() * 10;
        const gfx = renderSpike(obstacleColor, obstacleGlow, spikeSize);
        obs = new ex.Actor({
          x: W + 60,
          y: GROUND_Y - GROUND_H / 2 - spikeSize / 2,
          width: spikeSize * 0.7,
          height: spikeSize * 0.8,
          collisionType: ex.CollisionType.Passive,
        });
        obs.graphics.use(gfx);
      }
    }

    obs.on("collisionstart", (evt) => {
      if (evt.other.owner === player && !isDead) {
        isDead = true;
        deathEffect();
      }
    });

    scene.add(obs);
    obstacles.push(obs);
  }

  function deathEffect() {
    // Flash + slight delay before game over
    player.graphics.opacity = 0.3;
    player.vel = ex.vec(0, 0);
    player.acc = ex.vec(0, 0);

    const flashTimer = new ex.Timer({
      fcn: () => {
        gameOver();
      },
      interval: 600,
      repeats: false,
    });
    scene.add(flashTimer);
    flashTimer.start();
  }

  // ── Collectible stars ──
  let collectibleAccum = 0;
  function spawnCollectible() {
    const cp = currentParams();
    const collectGfx = renderSprite(assets.collectible, 16);
    const col = new ex.Actor({
      x: W + 80,
      y: GROUND_Y - GROUND_H / 2 - 60 - Math.random() * 80,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Passive,
    });
    col.graphics.use(collectGfx);
    col.angularVelocity = 2;
    col.on("collisionstart", (evt) => {
      if (evt.other.owner === player) {
        addScore(10);
        col.kill();
      }
    });
    scene.add(col);
    obstacles.push(col);
  }

  // ── Progress line (ground line effect) ──
  const progressLine = new ex.Actor({
    x: 0,
    y: GROUND_Y - GROUND_H / 2 - 1,
    anchor: ex.vec(0, 0.5),
    width: W,
    height: 2,
    color: ex.Color.fromHex(config.colorPalette.accent),
    z: 5,
  });
  progressLine.graphics.opacity = 0.4;
  scene.add(progressLine);

  // ── Track jumped obstacles for scoring ──
  const jumpedObstacles = new Set<ex.Actor>();
  let lastPlayerX = PLAYER_X;

  // ── Input ──
  // Track pointer (mouse/touch) for click-to-jump
  let pointerDown = false;
  scene.on("preupdate", () => {
    pointerDown = engine.input.pointers.isDown(0);
  });

  // ── Main update loop ──
  scene.on("preupdate", (evt) => {
    if (isDead) return;

    const dt = evt.elapsed;
    const cp = currentParams();

    // ── Track timer ──
    trackElapsedMs += dt;
    const currentTrack = tracks[currentTrackIndex];
    
    // Start preloading next map when we're 75% through current song
    if (!preloadStarted && trackElapsedMs >= currentTrack.durationMs * 0.75) {
      preloadStarted = true;
      // Preload next map in background (will use fallback if Gemini is slow)
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      const nextTrack = tracks[nextIndex];
      if (nextTrack && !mapGenerator.getCachedMap(nextTrack.id)) {
        mapGenerator.generateMap(nextTrack)
          .then(map => {
            console.log(`Preloaded map for next track: ${nextTrack.name}`);
          })
          .catch(error => {
            console.warn(`Failed to preload map for ${nextTrack.name}:`, error);
          });
      }
    }
    
    if (trackElapsedMs >= currentTrack.durationMs) {
      switchToTrack(currentTrackIndex + 1);
      preloadStarted = false; // Reset for next song
    }

    // Transition interpolation
    if (transitioning && nextParams) {
      transitionProgress += dt / TRANSITION_MS;
      if (transitionProgress >= 1) {
        params = nextParams;
        nextParams = null;
        transitioning = false;
        transitionProgress = 0;
      }
    }

    // ── Gravity & Jump ──
    player.acc.y = cp.gravity;

    const jumpPressed =
      engine.input.keyboard.wasPressed(ex.Keys.Space) ||
      engine.input.keyboard.wasPressed(ex.Keys.Up) ||
      engine.input.keyboard.wasPressed(ex.Keys.W) ||
      pointerDown;

    const skipPressed = engine.input.keyboard.wasPressed(ex.Keys.Tab) || 
                        engine.input.keyboard.wasPressed(ex.Keys.Right);

    if (skipPressed && !isDead) {
      // Manual song skip
      console.log(`Skipping to next song`);
      switchToTrack(currentTrackIndex + 1);
      preloadStarted = false; // Reset for next song
    }

    if (jumpPressed && isGrounded) {
      player.vel.y = cp.jumpForce;
      isGrounded = false;
      // Spin rotation while airborne (GD style)
      player.angularVelocity = cp.scrollSpeed * 0.012;
    }

    // Keep player at fixed X
    player.pos.x = PLAYER_X;
    player.vel.x = 0;

    // Fell off screen
    if (player.pos.y > H + 100) {
      isDead = true;
      gameOver();
      return;
    }

    // ── Scroll ground ──
    for (const seg of groundSegments) {
      seg.pos.x -= cp.scrollSpeed * (dt / 1000);
      if (seg.pos.x + SEG_W < -10) {
        // Find rightmost segment and place after it
        let maxX = -Infinity;
        for (const s of groundSegments) {
          if (s.pos.x + SEG_W > maxX) maxX = s.pos.x + SEG_W;
        }
        seg.pos.x = maxX;
      }
    }

    // ── Scroll obstacles ──
    const scrollPx = cp.scrollSpeed * (dt / 1000);
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      if (ob.isKilled()) {
        obstacles.splice(i, 1);
        continue;
      }
      ob.pos.x -= scrollPx;
      if (ob.pos.x < -100) {
        ob.kill();
        obstacles.splice(i, 1);
      }
    }

    // ── Spawn obstacles ──
    spawnAccumulator += dt;
    
    // Use map-based spawning if available, otherwise fall back to interval-based
    if (mapBasedSpawning && shouldSpawnFromPattern()) {
      spawnObstacle();
      spawnAccumulator = 0; // Reset accumulator when we spawn from pattern
    } else if (spawnAccumulator >= cp.spawnInterval) {
      // Enforce minimum distance so the player can actually jump between obstacles
      const jumpDuration = 2 * Math.abs(cp.jumpForce) / cp.gravity;
      const jumpDistance = cp.scrollSpeed * jumpDuration;
      const minGap = jumpDistance + PLAYER_SIZE * 3;

      // Find the rightmost obstacle still on screen
      let rightmostX = -Infinity;
      for (const ob of obstacles) {
        if (!ob.isKilled() && ob.pos.x > rightmostX) {
          rightmostX = ob.pos.x;
        }
      }

      const spawnX = W + 60;
      if (rightmostX === -Infinity || spawnX - rightmostX >= minGap) {
        spawnAccumulator -= cp.spawnInterval;
        spawnObstacle();
      }
      // If too close, don't reset accumulator — retry next frame
    }

    // ── Spawn collectibles (only if not using map-based spawning) ──
    if (!mapBasedSpawning) {
      collectibleAccum += dt;
      if (collectibleAccum >= cp.spawnInterval * 2.5) {
        collectibleAccum -= cp.spawnInterval * 2.5;
        if (Math.random() < 0.6) {
          spawnCollectible();
        }
      }
    }

    // ── Track successfully jumped obstacles ──
    for (const ob of obstacles) {
      if (ob.isKilled() || jumpedObstacles.has(ob)) continue;
      
      // Check if player has passed the obstacle
      if (ob.pos.x < PLAYER_X && ob.pos.x + ob.width > lastPlayerX) {
        // Player just passed this obstacle - award points for successful jump
        if (ob.pos.y < GROUND_Y - GROUND_H / 2 - 10) { // It's an obstacle, not ground
          addScore(1);
          jumpedObstacles.add(ob);
        }
      }
    }
    
    lastPlayerX = PLAYER_X;
  });
}
