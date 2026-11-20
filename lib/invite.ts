const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function newInvite(now: Date = new Date()): { code: string; expiresAt: string } {
  const bytes = crypto.getRandomValues(new Uint8Array(18)); // 18 bytes -> 24 base64 chars, no padding
  const code = btoa(String.fromCharCode.apply(null, Array.from(bytes))).replace(/\+/g, '-').replace(/\//g, '_');
  return { code, expiresAt: new Date(now.getTime() + WEEK_MS).toISOString() };
}

// Compares every character regardless of where the first mismatch is.
function sameCode(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkInvite(
  stored: { code: string | null; expiresAt: string | null },
  given: string,
  now: Date = new Date(),
): 'ok' | 'invalid' | 'expired' {
  if (!stored.code || !stored.expiresAt || !sameCode(stored.code, given)) return 'invalid';
  return now.getTime() > new Date(stored.expiresAt).getTime() ? 'expired' : 'ok';
}

export const INVALID_INVITE = 'Pautan jemputan tidak sah atau telah tamat tempoh.';
