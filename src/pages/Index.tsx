import { useState, useCallback } from "react";
import { AppScreen, PlaylistMetrics, GameConfiguration } from "@/types/game";
import LandingScreen from "@/components/screens/LandingScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import GameScreen from "@/components/screens/GameScreen";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [playlistMetrics, setPlaylistMetrics] = useState<PlaylistMetrics | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfiguration | null>(null);
  const [score, setScore] = useState(0);
  const [loadingStep, setLoadingStep] = useState<"gemini" | "engine">("gemini");

  const handleGenerate = useCallback(async (metrics: PlaylistMetrics) => {
    setPlaylistMetrics(metrics);
    setScreen("loading");
    setLoadingStep("gemini");

    try {
      // Step 1: Generate game config with AI
      const { data: geminiData, error: geminiError } = await supabase.functions.invoke("gemini-generate", {
        body: { metrics },
      });

      if (geminiError || !geminiData) {
        throw new Error(geminiError?.message || "Failed to generate game");
      }

      setGameConfig(geminiData as GameConfiguration);
      setLoadingStep("engine");

      // Step 2: Brief pause for engine setup visual
      await new Promise((r) => setTimeout(r, 1200));

      setScreen("game");
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
      setScreen("landing");
    }
  }, []);

  const handleRestart = useCallback(() => {
    setScreen("landing");
    setPlaylistMetrics(null);
    setGameConfig(null);
    setScore(0);
  }, []);

  if (screen === "loading") {
    return <LoadingScreen step={loadingStep} metrics={playlistMetrics} />;
  }

  if (screen === "game" && gameConfig) {
    return (
      <GameScreen
        config={gameConfig}
        metrics={playlistMetrics!}
        score={score}
        onScoreChange={setScore}
        onRestart={handleRestart}
      />
    );
  }

  return <LandingScreen onGenerate={handleGenerate} />;
};

export default Index;
