// ============================================================================
// Child face generation service
// Calls the /api/generate-child TanStack server route which uses the Lovable
// AI Gateway (google/gemini-2.5-flash-image) to blend the two parent photos.
// ============================================================================

export type ChildAge = "toddler" | "child" | "teen";
export type ChildGender = "surprise" | "boy" | "girl";

export interface GenerateChildInput {
  parent1: string; // data URL
  parent2: string; // data URL
  age: ChildAge;
  gender: ChildGender;
}

export interface GenerateChildResult {
  imageUrl: string;
}

export async function generateChild(input: GenerateChildInput): Promise<GenerateChildResult> {
  const resp = await fetch("/api/generate-child", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(msg || `Request failed (${resp.status})`);
  }
  return (await resp.json()) as GenerateChildResult;
}
