import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Lock, ArrowLeft, Eye, Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { verifyAdminPassword, getAdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — GenBlend" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Stats = Awaited<ReturnType<typeof getAdminStats>>;

function AdminPage() {
  const verify = useServerFn(verifyAdminPassword);
  const fetchStats = useServerFn(getAdminStats);

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async (pwd: string) => {
    setLoading(true);
    try {
      const s = await fetchStats({ data: { password: pwd } });
      setStats(s);
    } catch {
      toast.error("Failed to load stats.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { ok } = await verify({ data: { password } });
      if (!ok) {
        toast.error("Wrong password.");
        return;
      }
      setAuthed(true);
      await loadStats(password);
    } catch {
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Toaster position="top-center" />
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Admin access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={loading || !password}>
                {loading ? "Checking…" : "Sign in"}
              </Button>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Back to site
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Participation analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => loadStats(password)}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Home
              </Link>
            </Button>
          </div>
        </header>

        {stats && (
          <>
            {/* Stat cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                icon={Eye}
                label="Page views"
                total={stats.pageViews.total}
                day={stats.pageViews.last24h}
                week={stats.pageViews.last7d}
              />
              <StatCard
                icon={Wand2}
                label="Generations"
                total={stats.generations.total}
                day={stats.generations.last24h}
                week={stats.generations.last7d}
              />
            </div>

            {/* By mode */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base">Generations by mode</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.generations.byMode).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.generations.byMode).map(([mode, count]) => (
                      <span
                        key={mode}
                        className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium"
                      >
                        {mode}: <span className="font-bold text-primary">{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Recent generations ({stats.recent.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No generations yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                          <th className="pb-2 pr-3 font-medium">When</th>
                          <th className="pb-2 pr-3 font-medium">Mode</th>
                          <th className="pb-2 pr-3 font-medium">Names</th>
                          <th className="pb-2 font-medium">By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent.map((r) => (
                          <tr key={r.id} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-3 text-muted-foreground">
                              {new Date(r.createdAt).toLocaleString()}
                            </td>
                            <td className="py-2 pr-3">
                              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {r.mode}
                              </span>
                            </td>
                            <td className="py-2 pr-3">{r.childNames.join(", ") || "—"}</td>
                            <td className="py-2 text-muted-foreground">
                              {r.participantName || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  total,
  day,
  week,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  total: number;
  day: number;
  week: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className="text-4xl font-bold tracking-tight">{total.toLocaleString()}</div>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{day}</span> last 24h
          </span>
          <span>
            <span className="font-semibold text-foreground">{week}</span> last 7d
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
