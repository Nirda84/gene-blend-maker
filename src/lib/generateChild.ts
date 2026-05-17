// ============================================================================
// Child face generation service
// ----------------------------------------------------------------------------
// Replace `mockGenerate` with a real call to your image-gen provider
// (Fal.ai, Replicate, OpenAI, etc.). Keep the same input/output shape so the
// UI keeps working untouched.
// ============================================================================

import childPlaceholder from "@/assets/child-result.jpg";

export type ChildAge = "toddler" | "child" | "teen";
export type ChildGender = "surprise" | "boy" | "girl";

export interface GenerateChildInput {
  parent1: string; // data URL or remote URL
  parent2: string;
  age: ChildAge;
  gender: ChildGender;
}

export interface GenerateChildResult {
  imageUrl: string;
}

/**
 * Mock implementation — simulates a 4s generation delay.
 * Swap this body with a real API call when ready, e.g.:
 *
 *   const res = await fetch("https://api.your-provider.com/generate", {
 *     method: "POST",
 *     headers: { Authorization: `Bearer ${API_KEY}` },
 *     body: JSON.stringify(input),
 *   });
 *   const data = await res.json();
 *   return { imageUrl: data.output_url };
 */
export async function generateChild(input: GenerateChildInput): Promise<GenerateChildResult> {
  return mockGenerate(input);
}

async function mockGenerate(_input: GenerateChildInput): Promise<GenerateChildResult> {
  await new Promise((r) => setTimeout(r, 4000));
  return { imageUrl: childPlaceholder };
}
