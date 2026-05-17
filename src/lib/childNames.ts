// Curated names for AI-generated children
import type { ChildGender } from "./generateChild";

const BOY_NAMES = [
  "Liam", "Noah", "Ethan", "Leo", "Eitan", "Yonatan", "Daniel", "Adam",
  "Itai", "Omer", "Asher", "Ari", "Theo", "Mateo", "Kai", "Roi",
  "Nadav", "Tom", "Yali", "Ben", "Eli", "Ido", "Aviv", "Shai",
];

const GIRL_NAMES = [
  "Maya", "Noa", "Aria", "Talia", "Ella", "Romi", "Yael", "Mia",
  "Shira", "Lia", "Avigail", "Hila", "Tamar", "Eden", "Naomi", "Ayala",
  "Stav", "Roni", "Sivan", "Liel", "Adi", "Mika", "Ivy", "Luna",
];

export function pickRandomName(gender: ChildGender, exclude: string[] = []): string {
  const pool = (gender === "boy" ? BOY_NAMES : GIRL_NAMES).filter((n) => !exclude.includes(n));
  const list = pool.length ? pool : gender === "boy" ? BOY_NAMES : GIRL_NAMES;
  return list[Math.floor(Math.random() * list.length)];
}

export function pickNames(genders: ChildGender[]): string[] {
  const used: string[] = [];
  return genders.map((g) => {
    const n = pickRandomName(g, used);
    used.push(n);
    return n;
  });
}
