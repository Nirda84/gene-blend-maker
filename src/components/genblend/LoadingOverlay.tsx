import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STAGES = [
  "Analyzing facial structures…",
  "Mapping genetic blueprints…",
  "Blending DNA strands…",
  "Rendering portrait…",
];

export function LoadingOverlay() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-8 p-8 text-center">
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.2_320)] opacity-60 blur-2xl animate-pulse" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-5 rounded-full border-2 border-dashed border-[oklch(0.7_0.2_320)]/50 animate-[spin_5s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="min-h-[3rem]">
          <p className="text-lg font-semibold text-foreground">{STAGES[stage]}</p>
          <p className="mt-1 text-sm text-muted-foreground">This usually takes a few seconds</p>
        </div>
        <div className="flex gap-2">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= stage ? "w-8 bg-primary" : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
