import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Wand2,
  Download,
  Share2,
  Heart,
  RefreshCw,
  Baby,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { UploadZone } from "@/components/genblend/UploadZone";
import { LoadingOverlay } from "@/components/genblend/LoadingOverlay";
import {
  generateChild,
  type ChildAge,
  type GenMode,
} from "@/lib/generateChild";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GenBlend — See Your Future Family" },
      {
        name: "description",
        content:
          "Upload two photos and let AI imagine what your future child — or whole family — could look like.",
      },
      { property: "og:title", content: "GenBlend — See Your Future Family" },
      {
        property: "og:description",
        content: "AI-powered baby & family face prediction from two parent photos.",
      },
    ],
  }),
});

const MODE_OPTIONS: { value: GenMode; label: string; emoji: string; icon: typeof Baby }[] = [
  { value: "boy", label: "Boy", emoji: "💙", icon: Baby },
  { value: "girl", label: "Girl", emoji: "💖", icon: Baby },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧", icon: Users },
];

function Index() {
  const [parent1, setParent1] = useState<string | null>(null);
  const [parent2, setParent2] = useState<string | null>(null);
  const [age, setAge] = useState<ChildAge>("child");
  const [mode, setMode] = useState<GenMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const canGenerate = !!parent1 && !!parent2 && !!mode && !loading;

  const handleGenerate = async (overrideMode?: GenMode) => {
    const useMode = overrideMode ?? mode;
    if (!parent1 || !parent2) {
      toast.error("Please upload both parent photos first.");
      return;
    }
    if (!useMode) {
      toast.error("Pick what you'd like to create — Boy, Girl, or Family.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { imageUrl } = await generateChild({ parent1, parent2, age, mode: useMode });
      setResult(imageUrl);
      setTimeout(() => {
        document
          .getElementById("result")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    // Clear current result and reset mode so the user is asked again
    setResult(null);
    setMode(null);
    setTimeout(() => {
      document
        .getElementById("options")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "genblend.jpg";
    a.click();
  };

  const handleShare = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meet our future family!",
          text: "Made with GenBlend ✨",
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-40 right-0 -z-10 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-40 -z-10 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: "linear-gradient(135deg, oklch(0.85 0.1 25), oklch(0.78 0.16 320))" }}
        aria-hidden
      />

      {loading && <LoadingOverlay />}
      <Toaster position="top-center" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Nav */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.2_320)] shadow-soft">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">GenBlend</span>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur sm:flex">
            <Heart className="h-3.5 w-3.5 text-primary" /> Powered by AI magic
          </div>
        </header>

        {/* Hero */}
        <section className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            New: family portrait mode
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            See Your{" "}
            <span className="bg-gradient-to-r from-primary to-[oklch(0.65_0.22_330)] bg-clip-text text-transparent">
              Future Family
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Upload two photos. We'll blend the features and imagine your future little one — or the
            whole family — in seconds.
          </p>
        </section>

        {/* Upload */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8">
          <UploadZone
            label="Upload Parent 1"
            hint="e.g. Mom — clear face photo works best"
            value={parent1}
            onChange={setParent1}
            accent="pink"
          />
          <UploadZone
            label="Upload Parent 2"
            hint="e.g. Dad — clear face photo works best"
            value={parent2}
            onChange={setParent2}
            accent="indigo"
          />
        </section>

        {/* Options */}
        <section
          id="options"
          className="mt-10 rounded-3xl border border-border bg-card/70 p-6 shadow-soft backdrop-blur sm:p-8"
        >
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              What would you like to create?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {MODE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                      active
                        ? "border-primary bg-primary/10 shadow-soft"
                        : "border-border bg-background/60 hover:border-primary/50 hover:bg-primary/5",
                    )}
                    aria-pressed={active}
                  >
                    <div className="text-2xl">{opt.emoji}</div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-foreground">
              {mode === "family" ? "Child's age in the family portrait" : "Child's age"}
            </label>
            <Select value={age} onValueChange={(v) => setAge(v as ChildAge)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toddler">👶 Toddler (2–3)</SelectItem>
                <SelectItem value="child">🧒 Child (5–7)</SelectItem>
                <SelectItem value="teen">🧑 Teenager (14–16)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center">
            <div className="relative w-full sm:w-auto">
              {canGenerate && (
                <div
                  className="absolute -inset-1 rounded-2xl opacity-70 blur-lg"
                  style={{ background: "var(--gradient-primary)" }}
                  aria-hidden
                />
              )}
              <Button
                onClick={() => handleGenerate()}
                disabled={!canGenerate}
                size="lg"
                className="relative h-14 w-full rounded-2xl px-10 text-base font-semibold shadow-soft transition-transform hover:scale-[1.02] sm:w-auto"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Wand2 className="mr-2 h-5 w-5" />
                {mode === "family" ? "Generate Family Portrait" : "Blend & Generate"}
              </Button>
            </div>
            {!parent1 || !parent2 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Upload both photos to enable generation
              </p>
            ) : !mode ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Pick Boy, Girl, or Family above
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">Takes a few seconds ✨</p>
            )}
          </div>
        </section>

        {/* Result */}
        {result && (
          <section
            id="result"
            className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Meet your{" "}
                <span className="bg-gradient-to-r from-primary to-[oklch(0.65_0.22_330)] bg-clip-text text-transparent">
                  {mode === "family" ? "future family" : "future little one"}
                </span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A peek into what could be — generated just for you.
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <div className="relative">
                <div
                  className="absolute -inset-2 rounded-3xl opacity-60 blur-2xl"
                  style={{ background: "var(--gradient-primary)" }}
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-3xl border-4 border-card bg-card shadow-glow">
                  <img
                    src={result}
                    alt="AI-generated portrait"
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <Button
                onClick={handleRegenerate}
                variant="ghost"
                className="mt-3 w-full rounded-xl text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Create another (choose again)
              </Button>
            </div>
          </section>
        )}

        <footer className="mt-20 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>
            GenBlend is for entertainment only — generated images are imaginative, not predictive.
          </p>
        </footer>
      </main>
    </div>
  );
}
