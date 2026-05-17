import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { trackGeneration } from "@/lib/analytics.functions";
import {
  Sparkles,
  ArrowLeft,
  Wand2,
  Download,
  Share2,
  RefreshCw,
  Baby,
  Users,
  Plus,
  Minus,
  History as HistoryIcon,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  type FamilyChild,
  type ChildGender,
} from "@/lib/generateChild";
import { pickNames, pickRandomName } from "@/lib/childNames";
import {
  addHistoryEntry,
  clearHistory,
  loadHistory,
  removeHistoryEntry,
  type HistoryEntry,
} from "@/lib/genHistory";
import { dataUrlToFile } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create")({
  component: CreatePage,
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

function CreatePage() {
  const trackGen = useServerFn(trackGeneration);
  const [parent1, setParent1] = useState<string | null>(null);
  const [parent2, setParent2] = useState<string | null>(null);
  const [age, setAge] = useState<ChildAge>("child");
  const [soloName, setSoloName] = useState<string>("");
  const [participantName, setParticipantName] = useState<string>("");
  const [mode, setMode] = useState<GenMode | null>(null);
  const [familyChildren, setFamilyChildren] = useState<FamilyChild[]>([
    { gender: "boy", age: "child" },
    { gender: "girl", age: "child" },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    try {
      const saved = window.localStorage.getItem("genblend.participantName");
      if (saved) setParticipantName(saved);
    } catch {
      // ignore
    }
  }, []);

  const canGenerate =
    !!parent1 &&
    !!parent2 &&
    !!mode &&
    !loading &&
    (mode !== "family" || familyChildren.length > 0);

  const updateChild = (idx: number, patch: Partial<FamilyChild>) => {
    setFamilyChildren((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };
  const addChild = () => {
    if (familyChildren.length >= 5) return;
    setFamilyChildren((prev) => [...prev, { gender: "boy", age: "child" }]);
  };
  const addTwins = () => {
    if (familyChildren.length >= 4) {
      toast.error("Max 5 children — remove one first to add twins.");
      return;
    }
    setFamilyChildren((prev) => {
      const last = prev[prev.length - 1];
      const baseAge: ChildAge = last?.age ?? "child";
      const twinA: FamilyChild = { gender: "boy", age: baseAge };
      const twinB: FamilyChild = { gender: "girl", age: baseAge, twinWithPrev: true };
      return [...prev, twinA, twinB];
    });
    toast.success("Twins added 👶👶");
  };
  const removeChild = (idx: number) => {
    setFamilyChildren((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    if (!parent1 || !parent2) {
      toast.error("Please upload both parent photos first.");
      return;
    }
    if (!mode) {
      toast.error("Pick what you'd like to create — Boy, Girl, or Family.");
      return;
    }
    if (mode === "family" && familyChildren.length === 0) {
      toast.error("Add at least one child for the family portrait.");
      return;
    }

    // Assign names (use user-provided, else pick random)
    let names: string[] = [];
    let childrenWithNames: FamilyChild[] | undefined;
    if (mode === "family") {
      const used: string[] = [];
      childrenWithNames = familyChildren.map((c) => {
        const name = c.name?.trim() || pickRandomName(c.gender, used);
        used.push(name);
        return { ...c, name };
      });
      names = childrenWithNames.map((c) => c.name!);
    } else {
      const name = soloName.trim() || pickNames([mode as ChildGender])[0];
      names = [name];
    }

    setLoading(true);
    setResult(null);
    try {
      const { imageUrl } = await generateChild({
        parent1,
        parent2,
        age,
        mode,
        children: mode === "family" ? childrenWithNames : undefined,
        names,
      });
      const entry: Omit<HistoryEntry, "id" | "createdAt"> = {
        mode,
        age: mode !== "family" ? age : undefined,
        children: mode === "family" ? childrenWithNames : undefined,
        names,
        imageUrl,
      };
      const updated = addHistoryEntry(entry);
      setHistory(updated);
      setResult(updated[0]);
      // fire-and-forget analytics
      void trackGen({
        data: {
          mode,
          childNames: names,
          participantName: participantName.trim() || undefined,
        },
      }).catch(() => {});
      try {
        if (participantName.trim()) {
          window.localStorage.setItem("genblend.participantName", participantName.trim());
        }
      } catch {
        // ignore
      }
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
    a.href = result.imageUrl;
    a.download = `genblend-${result.names.join("-").toLowerCase()}.jpg`;
    a.click();
  };

  const shareText = useMemo(() => {
    if (!result) return "";
    const who =
      result.mode === "family"
        ? `our future family — meet ${result.names.join(", ")}`
        : `our future ${result.mode} — meet ${result.names[0]}`;
    return `Look at ${who}! ✨ Made with GenBlend`;
  }, [result]);

  const handleNativeShare = async () => {
    if (!result) return;
    const text = shareText;
    const url = window.location.href;
    try {
      const file = await dataUrlToFile(result.imageUrl, "genblend.jpg");
      const navAny = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (navAny.canShare && navAny.canShare({ files: [file] })) {
        await navigator.share({ title: "GenBlend", text, files: [file] });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "GenBlend", text, url });
        return;
      }
    } catch {
      // user cancelled or share failed
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast.success("Copied to clipboard!");
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
    toast.success("Link copied!");
  };

  const handleSelectFromHistory = (entry: HistoryEntry) => {
    setResult(entry);
    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = removeHistoryEntry(id);
    setHistory(updated);
    if (result?.id === id) setResult(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    toast.success("History cleared");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
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
        <header className="mb-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.2_320)] shadow-soft">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">GenBlend</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </header>

        <section className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            New: twins mode + history
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

        <section className="mb-6 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur sm:p-5">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Your name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="So we can say hi 👋"
            className="h-11 rounded-xl"
            maxLength={48}
          />
        </section>

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

          {mode !== "family" && mode !== null && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Child's age
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
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Name <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  value={soloName}
                  onChange={(e) => setSoloName(e.target.value)}
                  placeholder="Leave blank — we'll pick one"
                  className="h-12 rounded-xl"
                  maxLength={32}
                />
              </div>
            </div>
          )}

          {mode === "family" && (
            <div className="mt-6 rounded-2xl border border-border bg-background/40 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Children ({familyChildren.length})
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs"
                    onClick={addTwins}
                    disabled={familyChildren.length >= 4}
                  >
                    👶👶 Add twins
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={addChild}
                    disabled={familyChildren.length >= 5}
                    aria-label="Add child"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {familyChildren.map((child, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card/60 p-3"
                  >
                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground sm:w-20">
                        Child {idx + 1}
                        {child.twinWithPrev && idx > 0 && (
                          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            TWIN
                          </span>
                        )}
                      </div>
                      <Select
                        value={child.gender}
                        onValueChange={(v) => updateChild(idx, { gender: v as ChildGender })}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boy">💙 Boy</SelectItem>
                          <SelectItem value="girl">💖 Girl</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={child.age}
                        onValueChange={(v) => updateChild(idx, { age: v as ChildAge })}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="toddler">👶 Toddler (2–3)</SelectItem>
                          <SelectItem value="child">🧒 Child (5–7)</SelectItem>
                          <SelectItem value="teen">🧑 Teenager (14–16)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={child.name ?? ""}
                        onChange={(e) => updateChild(idx, { name: e.target.value })}
                        placeholder="Name (optional)"
                        className="h-10 rounded-lg"
                        maxLength={32}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 justify-self-end rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => removeChild(idx)}
                        disabled={familyChildren.length <= 1}
                        aria-label={`Remove child ${idx + 1}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    {idx > 0 && (
                      <label className="mt-2 flex cursor-pointer items-center gap-2 pl-1 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={!!child.twinWithPrev}
                          onChange={(e) =>
                            updateChild(idx, {
                              twinWithPrev: e.target.checked,
                              age: e.target.checked
                                ? familyChildren[idx - 1].age
                                : child.age,
                            })
                          }
                          className="h-3.5 w-3.5 rounded border-border"
                        />
                        Twin of Child {idx}
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                The portrait will include both parents + {familyChildren.length} child
                {familyChildren.length === 1 ? "" : "ren"}.
              </p>
            </div>
          )}

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

        {result && (
          <section
            id="result"
            className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Meet{" "}
                <span className="bg-gradient-to-r from-primary to-[oklch(0.65_0.22_330)] bg-clip-text text-transparent">
                  {result.names.length > 1
                    ? result.names.slice(0, -1).join(", ") + " & " + result.names[result.names.length - 1]
                    : result.names[0]}
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
                    src={result.imageUrl}
                    alt={`AI-generated portrait of ${result.names.join(", ")}`}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </div>

              {result.mode === "family" && result.children && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {result.children.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium backdrop-blur"
                    >
                      {c.gender === "boy" ? "💙" : "💖"} {result.names[i]}
                      {c.twinWithPrev && i > 0 ? " 👯" : ""}
                    </span>
                  ))}
                </div>
              )}

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
                  onClick={handleNativeShare}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <div className="mt-3">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="h-10 w-full rounded-xl"
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy link
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

        {history.length > 0 && (
          <section className="mt-20">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <HistoryIcon className="h-5 w-5 text-primary" /> Your history
                <span className="text-xs font-normal text-muted-foreground">
                  ({history.length})
                </span>
              </h3>
              <Button
                onClick={handleClearHistory}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear all
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 shadow-soft backdrop-blur transition hover:scale-[1.02] hover:shadow-glow"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectFromHistory(h)}
                    className="block w-full text-left"
                  >
                    <img
                      src={h.imageUrl}
                      alt={h.names.join(", ")}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-2.5">
                      <p className="truncate text-xs font-semibold">
                        {h.names.join(" & ")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {h.mode === "family" ? "Family" : h.mode === "boy" ? "Boy" : "Girl"} ·{" "}
                        {new Date(h.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHistory(h.id)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1.5 opacity-0 transition group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                    aria-label="Delete from history"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
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
