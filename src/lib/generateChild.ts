// ============================================================================
// Child / family face generation service
// ============================================================================

export type ChildAge = "toddler" | "child" | "teen";
export type GenMode = "boy" | "girl" | "family";

export interface GenerateChildInput {
  parent1: string; // data URL
  parent2: string; // data URL
  age: ChildAge;
  mode: GenMode;
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
