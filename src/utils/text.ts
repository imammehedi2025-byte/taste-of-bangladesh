/** Lower-cases and strips everything except letters/digits (Latin + Bangla) into a slug for duplicate checks. */
export function normalizeName(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9ঀ-৿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Trims, collapses whitespace and removes angle brackets so stored text can never carry markup. */
export function cleanText(s: string): string {
  return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

export function isSafeUrl(s: string): boolean {
  if (!s) return true;
  if (s.length > 300 || /[\s<>"]/.test(s)) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const toBnDigits = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/** Very small similarity check for "did you mean an existing food?" warnings. */
export function similar(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length > 4 && (a.includes(b) || b.includes(a))) return true;
  // Levenshtein ≤ 2 on short slugs
  if (Math.abs(a.length - b.length) > 2) return false;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length] <= 2;
}
