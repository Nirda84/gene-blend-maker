// ============================================================================
// Child / family face generation service
// ============================================================================

export type ChildAge = "toddler" | "child" | "teen";
export type GenMode = "boy" | "girl" | "family";
export type ChildGender = "boy" | "girl";

export interface FamilyChild {
  gender: ChildGender;
  age: ChildAge;
  name?: string;
  /** When true, this child is a twin of the previous sibling (same age, sibling resemblance). */
  twinWithPrev?: boolean;
}

export interface GenerateChildInput {
  parent1: string;
  parent2: string;
  age: ChildAge;
  mode: GenMode;
  children?: FamilyChild[];
  /** Optional names: index 0 = solo child name, or aligned with `children` array for family mode. */
  names?: string[];
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
