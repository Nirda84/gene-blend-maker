// LocalStorage-backed history for generated portraits

import type { GenMode, FamilyChild, ChildAge } from "./generateChild";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  mode: GenMode;
  age?: ChildAge;
  children?: FamilyChild[];
  names: string[];
  imageUrl: string; // base64 / data URL of result (already compressed by AI)
}

const KEY = "genblend.history.v1";
const MAX = 8;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry[] {
  const list = loadHistory();
  const next: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  const updated = [next, ...list].slice(0, MAX);
  persist(updated);
  return updated;
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  const updated = loadHistory().filter((e) => e.id !== id);
  persist(updated);
  return updated;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

function persist(list: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Quota exceeded — drop oldest until it fits, or give up.
    let trimmed = list.slice(0, Math.max(1, list.length - 1));
    while (trimmed.length > 0) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(trimmed));
        return;
      } catch {
        trimmed = trimmed.slice(0, trimmed.length - 1);
      }
    }
  }
}
