import { CaseProgress } from '../types';
import { getInitialProgress } from './storage';

export const CASE_CONTENT_VERSIONS: Record<string, number> = {
  'case-4': 2,
};

const CASE_VERSIONS_KEY = 'investignito_case_versions_v1';
const OUTRO_SEEN_KEY = 'investignito_outro_seen_v1';

function removeOutroSeen(caseId: string): void {
  try {
    const raw = localStorage.getItem(OUTRO_SEEN_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter((id) => id !== caseId);
      localStorage.setItem(OUTRO_SEEN_KEY, JSON.stringify(filtered));
    }
  } catch {
    // never throw
  }
}

/**
 * Checks content versions for all cases in CASE_CONTENT_VERSIONS.
 * If stored version (default 1) is lower than current version:
 * - replaces ONLY that case's entry with getInitialProgress(caseId)
 * - removes that case ID from "investignito_outro_seen_v1"
 * - stores the new version in "investignito_case_versions_v1"
 * Every other case is returned untouched.
 * All reads and writes are safely wrapped in try/catch and never throw.
 */
export function applyCaseVersionResets(
  progress: Record<string, CaseProgress>
): { updated: Record<string, CaseProgress>; changed: boolean } {
  const updated: Record<string, CaseProgress> = { ...progress };
  let changed = false;

  try {
    const rawVersions = localStorage.getItem(CASE_VERSIONS_KEY);
    let storedVersions: Record<string, number> = {};
    if (rawVersions) {
      try {
        const parsed = JSON.parse(rawVersions);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          storedVersions = parsed as Record<string, number>;
        }
      } catch {
        storedVersions = {};
      }
    }

    for (const [caseId, currentVersion] of Object.entries(CASE_CONTENT_VERSIONS)) {
      const storedVersion =
        typeof storedVersions[caseId] === 'number' ? storedVersions[caseId] : 1;

      if (storedVersion < currentVersion) {
        if (progress[caseId]) {
          updated[caseId] = getInitialProgress(caseId);
          changed = true;
        }
        removeOutroSeen(caseId);
        storedVersions[caseId] = currentVersion;
        try {
          localStorage.setItem(CASE_VERSIONS_KEY, JSON.stringify(storedVersions));
        } catch {
          // never throw
        }
      }
    }
  } catch {
    // never throw
  }

  return { updated, changed };
}
