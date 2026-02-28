
# 🎮 Spotify-Powered AI Game Generator

## Overview
A polished web app where users input a Spotify playlist URL, the app analyzes the playlist's audio characteristics, sends them to Gemini AI, and Gemini decides what type of game to generate along with its configuration. The game is then rendered using Excalibur.js embedded in a React UI.

## Page 1: Landing / Input Page
- Eye-catching hero section with animated visuals
- Input field for Spotify playlist URL/ID
- "Generate Game" button
- Brief explanation of how it works (3-step visual: Analyze → AI Generate → Play)

## Page 2: Loading / Generation Screen
- Animated loading state showing progress:
  - Step 1: "Analyzing your playlist..." (fetching Spotify data)
  - Step 2: "AI is designing your game..." (Gemini processing)
  - Step 3: "Building your world..." (engine setup)
- Display playlist info (name, track count, cover art) while loading

## Page 3: Game Screen
- Full-screen Excalibur.js canvas embedded in React
- HUD overlay showing: score, playlist name, current track info
- Pause menu with option to regenerate or go back
- Game over screen with score and "Try Another Playlist" button

## Game Mechanics (AI-Selectable Templates)
Gemini will choose from and configure these predefined game templates based on playlist mood:
- **Platformer** — jump between platforms, collect items (for energetic/upbeat playlists)
- **Dodge/Survive** — avoid falling/spawning obstacles (for intense/high-energy playlists)
- **Chill Collector** — float and collect particles in a relaxed environment (for calm/acoustic playlists)
- **Rhythm Runner** — auto-scroll runner where tempo drives speed (for rhythmic playlists)

AI configures: gravity, speed, spawn rates, color palette, enemy types, background theme, difficulty

## Backend (Lovable Cloud Edge Functions)
- **Spotify edge function**: Handles Spotify API authentication (Client Credentials flow) and fetches playlist audio features (tempo, energy, valence, acousticness, danceability)
- **Gemini edge function**: Takes playlist metrics, sends structured prompt to Gemini, returns validated game configuration JSON

## Data Flow
1. User enters playlist URL → frontend extracts playlist ID
2. Frontend calls Spotify edge function → returns aggregated playlist metrics
3. Frontend calls Gemini edge function with metrics → returns game configuration (game type, physics, visuals, difficulty)
4. Frontend initializes Excalibur.js with the configuration → game starts

## Tech Details
- Excalibur.js integrated via React ref/useEffect pattern
- Spotify API key stored as Lovable Cloud secret
- Gemini API key stored as Lovable Cloud secret
- Structured output via Gemini's responseSchema for reliable JSON

## Polish
- Smooth transitions between screens
- Responsive design (though game is best on desktop)
- Toast notifications for errors (invalid playlist, API failures)
- Dark-themed UI fitting the gaming aesthetic
