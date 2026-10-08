const COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-pink-500", "bg-cyan-600",
];

/** Deterministic color for a given name — same input always maps to the same color, so a person/store keeps one identity color everywhere it appears. */
export function avatarColor(name?: string | null): string {
  if (!name) return COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export function initials(name?: string | null): string {
  if (!name || !name.trim()) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words.slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";
}
