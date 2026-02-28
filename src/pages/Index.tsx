import { useState, useCallback } from "react";
import { AppScreen, GameConfiguration } from "@/types/game";
import LandingScreen from "@/components/screens/LandingScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import GameScreen from "@/components/screens/GameScreen";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [playlistName, setPlaylistName] = useState("");
  const [gameConfig, setGameConfig] = useState<GameConfiguration | null>(null);
  const [score, setScore] = useState(0);
  const [loadingStep, setLoadingStep] = useState<"gemini" | "engine">("gemini");

  const handleGenerate = useCallback(async (name: string) => {
    setPlaylistName(name);
    setScreen("loading");
    setLoadingStep("gemini");

    try {
      const { data: geminiData, error: geminiError } = await supabase.functions.invoke("gemini-generate", {
        body: { playlistName: name },
      });

      if (geminiError || !geminiData) {
        throw new Error(geminiError?.message || "Failed to generate game");
      }

      setGameConfig(geminiData as GameConfiguration);
      setLoadingStep("engine");

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
    setPlaylistName("");
    setGameConfig(null);
    setScore(0);
  }, []);

  if (screen === "loading") {
    return <LoadingScreen step={loadingStep} playlistName={playlistName} />;
  }

  if (screen === "game" && gameConfig) {
    return (
      <GameScreen
        config={gameConfig}
        playlistName={playlistName}
        score={score}
        onScoreChange={setScore}
        onRestart={handleRestart}
      />
    );
  }

  return <LandingScreen onGenerate={handleGenerate} />;
};

export default Index;
