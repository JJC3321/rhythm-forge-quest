# BeatDash

Transform your Spotify playlists into AI-powered rhythm game adventures.

## About

BeatDash is a web application that uses AI to convert Spotify playlists into unique rhythm games. The app analyzes your playlist's musical characteristics and generates custom game mechanics, obstacles, and visual themes that match the mood and energy of your music.

## Features

- **Spotify Integration**: Connect any Spotify playlist to analyze tracks
- **AI-Powered Generation**: Uses Google Gemini to create unique game configurations based on playlist metadata
- **Dynamic Gameplay**: Game mechanics adapt to tempo, energy, danceability, and other audio features
- **Real-time Map Generation**: Procedurally generated obstacle patterns that sync with your music
- **Visual Themes**: AI-generated color palettes and assets that match your playlist's vibe

## How it works

1. **Connect**: Paste a Spotify playlist link
2. **Analyze**: The app extracts audio features and metadata from your tracks
3. **Generate**: Gemini AI creates game mechanics, themes, and configurations
4. **Play**: Experience your music as an interactive rhythm game

## Tech stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Game Engine**: Excalibur.js for 2D game mechanics
- **Backend**: Supabase for serverless functions
- **AI**: Google Gemini for game generation
- **Music API**: Spotify Web API for playlist analysis

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
