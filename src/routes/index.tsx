import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Wand2, Upload, Users, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackPageView } from "@/lib/analytics.functions";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "GenBlend — See Your Future Family" },
      {
        name: "description",
        content:
          "Upload two photos and let AI imagine what your future child — or whole family — could look like. Free and instant.",
      },
      { property: "og:title", content: "GenBlend — See Your Future Family" },
      {
        property: "og:description",
        content: "AI-powered baby & family face prediction from two parent photos.",
      },
    ],
  }),
});

function Landing() {
  const trackView = useServerFn(trackPageView);

  useEffect(() => {
    void trackView({
      data: {
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
      },
    }).catch(() => {});
  }, [trackView]);

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

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-16 flex items-center justify-between">
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
        <section className="mb-24 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Free · No signup required
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            See Your{" "}
            <span className="bg-gradient-to-r from-primary to-[oklch(0.65_0.22_330)] bg-clip-text text-transparent">
              Future Family
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Upload two parent photos. Our AI blends their features to imagine your future child —
            or the whole family — in just seconds.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="relative">
              <div
                className="absolute -inset-1 rounded-2xl opacity-70 blur-lg"
                style={{ background: "var(--gradient-primary)" }}
                aria-hidden
              />
              <Button
                asChild
                size="lg"
                className="relative h-14 rounded-2xl px-10 text-base font-semibold shadow-soft transition-transform hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Link to="/create">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Takes about 10 seconds ✨
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-24">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                icon: Upload,
                title: "Upload photos",
                desc: "Choose two clear face photos — one of each parent.",
              },
              {
                step: "2",
                icon: Users,
                title: "Pick what to create",
                desc: "A future boy, girl, twins, or a full family portrait.",
              },
              {
                step: "3",
                icon: Sparkles,
                title: "Meet your child",
                desc: "Our AI blends genetic features and delivers a portrait in seconds.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative rounded-3xl border border-border bg-card/70 p-6 shadow-soft backdrop-blur transition hover:scale-[1.02] hover:shadow-glow"
              >
                <div className="absolute -top-3 -left-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.2_320)] text-sm font-bold text-primary-foreground shadow-soft">
                  {step}
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mb-16 rounded-3xl border border-border bg-card/70 p-10 text-center shadow-soft backdrop-blur sm:p-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to meet your future child?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Free, instant, and no account needed. Just two photos and a little AI magic.
          </p>
          <div className="mt-8 inline-block">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-2xl px-10 text-base font-semibold shadow-soft transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Link to="/create">
                <Wand2 className="mr-2 h-5 w-5" />
                Try it now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>
            GenBlend is for entertainment only — generated images are imaginative, not predictive.
          </p>
        </footer>
      </main>
    </div>
  );
}
