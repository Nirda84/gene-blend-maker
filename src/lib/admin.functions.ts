import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (password.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < password.length; i++) {
    mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    return { ok: checkPassword(data.password) };
  });

export const getAdminStats = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) {
      throw new Error("Unauthorized");
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      pvTotal,
      pvDay,
      pvWeek,
      genTotal,
      genDay,
      genWeek,
      recent,
      allGens,
    ] = await Promise.all([
      supabaseAdmin.from("page_views").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayAgo),
      supabaseAdmin
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      supabaseAdmin.from("generations").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("generations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayAgo),
      supabaseAdmin
        .from("generations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      supabaseAdmin
        .from("generations")
        .select("id, created_at, mode, child_names, participant_name")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin.from("generations").select("mode"),
    ]);

    const byMode: Record<string, number> = {};
    for (const row of allGens.data ?? []) {
      const m = row.mode as string;
      byMode[m] = (byMode[m] ?? 0) + 1;
    }

    return {
      pageViews: {
        total: pvTotal.count ?? 0,
        last24h: pvDay.count ?? 0,
        last7d: pvWeek.count ?? 0,
      },
      generations: {
        total: genTotal.count ?? 0,
        last24h: genDay.count ?? 0,
        last7d: genWeek.count ?? 0,
        byMode,
      },
      recent: (recent.data ?? []).map((r) => ({
        id: r.id as string,
        createdAt: r.created_at as string,
        mode: r.mode as string,
        childNames: (r.child_names as string[]) ?? [],
        participantName: (r.participant_name as string | null) ?? null,
      })),
    };
  });
