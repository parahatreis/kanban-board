/** UI helpers for card presentation (not persisted in schema). */

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function parseLabelBadges(label: string): {
  primary?: string;
  secondary?: string;
} {
  const t = label.trim();
  if (!t) return {};
  const parts = t
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { primary: parts[0], secondary: parts[1] };
  }
  return { primary: parts[0] };
}

export function pseudoDateForCard(cardId: string): string {
  const h = hashString(cardId);
  const day = 1 + (h % 28);
  const month = 1 + (h % 12);
  const d = new Date(2026, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Two-letter initials for overlapping avatar stack (deterministic). */
export function avatarInitialsForCard(cardId: string, index: number): string {
  const h = hashString(cardId + String(index));
  const a = String.fromCharCode(65 + (h % 26));
  const b = String.fromCharCode(65 + ((h >> 3) % 26));
  return `${a}${b}`;
}

export function taskIconGradient(cardId: string): string {
  const gradients = [
    "from-violet-500 to-indigo-600",
    "from-fuchsia-500 to-rose-500",
    "from-cyan-500 to-blue-600",
    "from-emerald-400 to-teal-600",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-violet-500",
  ];
  return gradients[hashString(cardId) % gradients.length];
}

/** Top-right status / type indicator (reference: alert, done, or neutral tool). */
export type CardStatusKind = "alert" | "success" | "file" | "mail" | "phone";

const ASSIGNEE_NAMES = [
  "Sara Thompson",
  "James Patel",
  "Alex Rivera",
  "Morgan Chen",
  "Jordan Kim",
  "Casey Lopez",
] as const;

export function getCardUiMeta(cardId: string): {
  kind: CardStatusKind;
  /** When true, due date uses alert styling (reference: urgent tasks). */
  urgent: boolean;
  assigneeName: string;
  commentCount: number;
  /** e.g. "September 12" */
  dueShort: string;
} {
  const h = hashString(cardId);
  const kinds: CardStatusKind[] = [
    "alert",
    "success",
    "file",
    "mail",
    "phone",
  ];
  const kind = kinds[h % kinds.length];
  const assigneeName = ASSIGNEE_NAMES[h % ASSIGNEE_NAMES.length];
  const commentCount = 1 + (h % 28);
  const day = 1 + (h % 28);
  const month = h % 12;
  const d = new Date(2026, month, day);
  const dueShort = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const urgent = kind === "alert";
  return { kind, urgent, assigneeName, commentCount, dueShort };
}

/** Single assignee avatar gradient (reference: vibrant circle). */
export function assigneeAvatarGradient(cardId: string): string {
  const gradients = [
    "from-amber-300 via-orange-400 to-rose-500",
    "from-violet-500 to-fuchsia-500",
    "from-cyan-400 to-blue-600",
    "from-emerald-400 to-teal-500",
    "from-sky-400 to-indigo-500",
  ];
  return gradients[hashString(cardId) % gradients.length];
}
