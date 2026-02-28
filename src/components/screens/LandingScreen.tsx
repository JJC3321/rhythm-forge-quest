import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Sparkles, Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PlaylistMetrics } from "@/types/game";

interface LandingScreenProps {
  onGenerate: (metrics: PlaylistMetrics) => void;
}

const steps = [
  { icon: Music, label: "Describe", desc: "Tell us about your playlist's vibe" },
  { icon: Sparkles, label: "AI Generate", desc: "Gemini designs a unique game" },
  { icon: Gamepad2, label: "Play", desc: "Jump into your custom world" },
];

const LandingScreen = ({ onGenerate }: LandingScreenProps) => {
  const [name, setName] = useState("");
  const [energy, setEnergy] = useState(0.5);
  const [tempo, setTempo] = useState(120);
  const [valence, setValence] = useState(0.5);
  const [danceability, setDanceability] = useState(0.5);
  const [acousticness, setAcousticness] = useState(0.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onGenerate({
      playlistName: name.trim(),
      playlistImage: "",
      trackCount: 20,
      avgTempo: tempo,
      avgEnergy: energy,
      avgValence: valence,
      avgAcousticness: acousticness,
      avgDanceability: danceability,
      avgLoudness: -8,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-2xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-2"
        >
          <Gamepad2 className="w-16 h-16 mx-auto text-primary mb-4" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          <span className="text-gradient">Playlist</span>
          <br />
          <span className="text-foreground">to Game</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-md mx-auto">
          Describe your playlist's vibe. AI builds you a game inspired by it.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-12 space-y-6 text-left">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Playlist Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Late Night Vibes"
              className="h-12 text-base bg-muted/50 border-border/50 placeholder:text-muted-foreground/50 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Energy <span className="text-muted-foreground font-mono text-xs ml-2">{Math.round(energy * 100)}%</span>
            </label>
            <Slider value={[energy]} onValueChange={([v]) => setEnergy(v)} min={0} max={1} step={0.01} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tempo <span className="text-muted-foreground font-mono text-xs ml-2">{tempo} BPM</span>
            </label>
            <Slider value={[tempo]} onValueChange={([v]) => setTempo(v)} min={60} max={200} step={1} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Happiness / Valence <span className="text-muted-foreground font-mono text-xs ml-2">{Math.round(valence * 100)}%</span>
            </label>
            <Slider value={[valence]} onValueChange={([v]) => setValence(v)} min={0} max={1} step={0.01} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Danceability <span className="text-muted-foreground font-mono text-xs ml-2">{Math.round(danceability * 100)}%</span>
            </label>
            <Slider value={[danceability]} onValueChange={([v]) => setDanceability(v)} min={0} max={1} step={0.01} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Acousticness <span className="text-muted-foreground font-mono text-xs ml-2">{Math.round(acousticness * 100)}%</span>
            </label>
            <Slider value={[acousticness]} onValueChange={([v]) => setAcousticness(v)} min={0} max={1} step={0.01} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 glow-primary font-semibold text-base gap-2"
            disabled={!name.trim()}
          >
            Generate Game
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
              className="glass rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{step.label}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
