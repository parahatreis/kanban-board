/** UI helpers for card presentation. */

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Gradient class for assignee avatar ring (stable per id). */
export function assigneeAvatarGradient(stableId: string): string {
  const gradients = [
    "from-amber-300 via-orange-400 to-rose-500",
    "from-violet-500 to-fuchsia-500",
    "from-cyan-400 to-blue-600",
    "from-emerald-400 to-teal-500",
    "from-sky-400 to-indigo-500",
  ];
  return gradients[hashString(stableId) % gradients.length];
}

/** Two-letter initials from display name or email local-part. */
export function initialsFromUser(
  displayName: string | null | undefined,
  email: string,
): string {
  const name = displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (
        parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)
      ).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? email;
  return local.slice(0, 2).toUpperCase() || "?";
}
