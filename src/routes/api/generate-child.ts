import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";

type Age = "toddler" | "child" | "teen";
type Gender = "boy" | "girl";
type Mode = "boy" | "girl" | "family";

type FamilyChild = { gender: Gender; age: Age; name?: string; twinWithPrev?: boolean };

type Body = {
  parent1: string;
  parent2: string;
  age: Age;
  mode: Mode;
  children?: FamilyChild[];
  names?: string[];
};

const AGE_LABEL: Record<Age, string> = {
  toddler: "around 2-3 years old",
  child: "around 5-7 years old",
  teen: "around 14-16 years old",
};

const GENDER_LABEL: Record<Gender, string> = {
  boy: "a boy",
  girl: "a girl",
};

function dataUrlToParts(dataUrl: string) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], base64: m[2], dataUrl };
}

function buildPrompt(body: Body) {
  if (body.mode === "family") {
    const kids = (body.children && body.children.length > 0
      ? body.children
      : [
          { gender: "boy", age: "child" },
          { gender: "girl", age: "child" },
        ]) as FamilyChild[];

    // Group twins together for clearer prompt
    const parts: string[] = [];
    kids.forEach((c, i) => {
      const namePart = c.name ? ` (named ${c.name})` : "";
      const twinPart = c.twinWithPrev && i > 0 ? " — TWIN sibling of the previous child (same age, strong resemblance)" : "";
      parts.push(`${i + 1}) ${GENDER_LABEL[c.gender]} ${AGE_LABEL[c.age]}${namePart}${twinPart}`);
    });
    const kidsDescription = parts.join("; ");

    const hasTwins = kids.some((c, i) => i > 0 && c.twinWithPrev);

    return [
      "You are given two photos of two adults — the parents.",
      "CRITICAL: Preserve the parents' likeness as closely as possible. Their faces in the output MUST clearly look like the SAME people from the reference photos — same face shape, eye color/shape, nose, lips, hair color and style, skin tone. Do not stylize or rejuvenate the parents.",
      `Generate ONE photorealistic family portrait that includes BOTH parents (faithful likeness) together with ${kids.length} child${kids.length === 1 ? "" : "ren"}: ${kidsDescription}.`,
      "Each child's face MUST visibly blend features inherited from both parents (skin tone, eye color, hair, nose and lip shape proportionally). Siblings should look related to each other and to the parents.",
      hasTwins ? "For TWIN siblings: render them with very similar facial features and identical age, standing close together. Identical twins should look near-identical; if both same gender treat as identical twins." : "",
      "Composition: a single cohesive family standing or sitting close together, warm friendly natural expressions, soft neutral studio background, even flattering lighting, high-quality photography.",
      `The portrait must show EXACTLY ${2 + kids.length} people in total (2 parents + ${kids.length} child${kids.length === 1 ? "" : "ren"}). No extra people, no duplicated faces, no collage, no text, no watermark.`,
    ].filter(Boolean).join(" ");
  }

  const genderStr = body.mode === "boy" ? "a boy" : "a girl";
  const soloName = body.names?.[0];
  const namePart = soloName ? ` (imagined name: ${soloName})` : "";
  return [
    "You are given two photos of two adults (the parents).",
    "Carefully study the facial features of BOTH people: face shape, eye color and shape, nose, lips, eyebrows, skin tone, hair color/texture.",
    `Generate ONE photorealistic studio portrait of their imagined biological child as ${genderStr}, ${AGE_LABEL[body.age]}${namePart}.`,
    "The child's face MUST visibly blend features inherited from both parents (mix skin tone, eye color, hair, nose and lip shape proportionally).",
    "Output: a single high-quality, front-facing, well-lit portrait on a soft neutral background. Friendly natural expression. No text, no watermark, no collage, no multiple faces.",
  ].join(" ");
}

export const Route = createFileRoute("/api/generate-child")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const p1 = dataUrlToParts(body.parent1);
        const p2 = dataUrlToParts(body.parent2);
        if (!p1 || !p2) {
          return new Response("Both parent images required as data URLs", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY on server", { status: 500 });
        }

        const prompt = buildPrompt(body);

        const payload = {
          model: "google/gemini-2.5-flash-image",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: p1.dataUrl } },
                { type: "image_url", image_url: { url: p2.dataUrl } },
              ],
            },
          ],
        };

        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (resp.status === 429) {
          return new Response("Rate limit exceeded. Please try again shortly.", { status: 429 });
        }
        if (resp.status === 402) {
          return new Response(
            "AI credits exhausted. Add credits in Settings > Workspace > Usage.",
            { status: 402 },
          );
        }
        if (!resp.ok) {
          const text = await resp.text();
          return new Response(`AI gateway error: ${text}`, { status: 502 });
        }

        const data = (await resp.json()) as {
          choices?: Array<{
            message?: {
              content?: string;
              images?: Array<{ image_url?: { url?: string } }>;
            };
          }>;
        };
        const msg = data.choices?.[0]?.message;
        const url = msg?.images?.[0]?.image_url?.url;
        if (!url) {
          return new Response(`No image returned. ${msg?.content ?? ""}`.trim(), { status: 502 });
        }

        return Response.json({ imageUrl: url });
      },
    },
  },
});
