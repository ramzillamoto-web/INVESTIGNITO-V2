const OUTRO_SEEN_KEY = 'investignito_outro_seen_v1';

/**
 * Checks if the player has previously watched the automatic outro video for this case.
 * Uses localStorage key "investignito_outro_seen_v1" storing an array of case IDs.
 */
export function hasSeenOutro(caseId: string): boolean {
  try {
    const raw = localStorage.getItem(OUTRO_SEEN_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.includes(caseId);
  } catch {
    return false;
  }
}

/**
 * Marks an outro as seen for the specified case.
 * Safely writes to localStorage and never throws.
 */
export function markOutroSeen(caseId: string): void {
  try {
    const raw = localStorage.getItem(OUTRO_SEEN_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const list: string[] = Array.isArray(parsed) ? (parsed as string[]) : [];
    if (!list.includes(caseId)) {
      list.push(caseId);
      localStorage.setItem(OUTRO_SEEN_KEY, JSON.stringify(list));
    }
  } catch {
    // never throw
  }
}

/**
 * Checks if automatic video playback should be bypassed due to user preference
 * for reduced motion or active Data Saver (Save-Data header / connection setting).
 */
export function shouldSkipAutomaticOutro(): boolean {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
    }
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      if (conn && conn.saveData === true) {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}
