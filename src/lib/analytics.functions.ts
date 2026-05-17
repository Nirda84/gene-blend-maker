import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((input: { userAgent?: string }) =>
    z.object({ userAgent: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("page_views")
      .insert({ user_agent: data.userAgent ?? null });
    if (error) {
      console.error("trackPageView error:", error);
      return { ok: false };
    }
    return { ok: true };
  });

export const trackGeneration = createServerFn({ method: "POST" })
  .inputValidator((input: { mode: string; childNames: string[]; participantName?: string }) =>
    z
      .object({
        mode: z.enum(["boy", "girl", "family", "solo", "twins"]),
        childNames: z.array(z.string().max(64)).max(10),
        participantName: z.string().max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("generations").insert({
      mode: data.mode,
      child_names: data.childNames,
      participant_name: data.participantName?.trim() || null,
    });
    if (error) {
      console.error("trackGeneration error:", error);
      return { ok: false };
    }
    return { ok: true };
  });
