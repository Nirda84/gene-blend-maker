import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";

type Mode = "boy" | "girl" | "family";

type Body = {
  parent1: string; // data URL
  parent2: string;
  age: "toddler" | "child" | "teen";
  mode: Mode;
};

const AGE_LABEL: Record<Body["age"], string> = {
  toddler: "around 2-3 years old",
  child: "around 5-7 years old",
  teen: "around 14-16 years old",
};

function dataUrlToParts(dataUrl: string) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], base64: m[2], dataUrl };
}

function buildPrompt(mode: Mode, age: Body["age"]) {
  const ageStr = AGE_LABEL[age];
  if (mode === "family") {
    return [
      "You are given two photos of two adults (the parents).",
      "Carefully study the facial features of BOTH people: face shape, eye color and shape, nose, lips, eyebrows, skin tone, hair color/texture.",
      `Generate ONE photorealistic studio family portrait that includes BOTH parents (preserve their likeness faithfully) together with their imagined biological child (${ageStr}).`,
      "The child's face MUST visibly blend features inherited from both parents (skin tone, eye color, hair, nose and lip shape proportionally).",
      "Composition: the family standing or sitting close together, warm friendly expressions, soft neutral background, well-lit, high-quality photography.",
      "No text, no watermark, no collage, no duplicated faces.",
    ].join(" ");
  }
  const genderStr = mode === "boy" ? "a boy" : "a girl";
  return [
    "You are given two photos of two adults (the parents).",
    "Carefully study the facial features of BOTH people: face shape, eye color and shape, nose, lips, eyebrows, skin tone, hair color/texture.",
    `Generate ONE photorealistic studio portrait of their imagined biological child as ${genderStr}, ${ageStr}.`,
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

        const prompt = buildPrompt(body.mode, body.age);

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
