import { CaseProgress, ViewMode } from '../types';

const STORAGE_KEY = 'thornbury_case_1_progress_v2';
export const STORAGE_VERSION = 1;
export const SESSION_STORAGE_KEY = 'investignito_session_v1';
export const SEEN_HOWTO_KEY = 'investignito_seen_howto_v1';
const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes cooldown

export interface SessionData {
  view: ViewMode;
  selectedCaseId: string;
}

const VALID_VIEWS: ViewMode[] = ['how_to_play', 'case_detail'];
const VALID_CASE_IDS = ['case-1', 'case-2', 'case-3', 'case-4'];

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const view = parsed.view;
    const selectedCaseId = parsed.selectedCaseId;

    if (
      typeof view === 'string' &&
      VALID_VIEWS.includes(view as ViewMode) &&
      typeof selectedCaseId === 'string' &&
      VALID_CASE_IDS.includes(selectedCaseId)
    ) {
      return {
        view: view as ViewMode,
        selectedCaseId,
      };
    }
    return null;
  } catch (e) {
    console.warn('Failed to load session from localStorage:', e);
    return null;
  }
}

export function saveSession(session: SessionData): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to save session to localStorage:', e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear session from localStorage:', e);
  }
}

export function hasSeenHowTo(): boolean {
  try {
    return localStorage.getItem(SEEN_HOWTO_KEY) === 'true';
  } catch (e) {
    console.warn('Failed to read seen howto flag:', e);
    return false;
  }
}

export function markSeenHowTo(): void {
  try {
    localStorage.setItem(SEEN_HOWTO_KEY, 'true');
  } catch (e) {
    console.warn('Failed to save seen howto flag:', e);
  }
}

export function getInitialProgress(caseId: string): CaseProgress {
  return {
    caseId,
    status: 'unsolved',
    elapsedSeconds: 0,
    startedAt: null,
    lastActiveAt: null,
    markings: {},
    markingColors: {},
    activeMarkColor: 'red',
    cooldownUntil: null,
    solvedAt: null,
    solveTimeSeconds: null,
    incorrectAttempts: 0,
    notes: '',
    checkedClues: [],
  };
}

export function migrateStorageData(rawParsed: unknown): Record<string, unknown> {
  if (!rawParsed || typeof rawParsed !== 'object' || Array.isArray(rawParsed)) {
    return {};
  }

  const data = rawParsed as Record<string, unknown>;

  // Current or versioned format: { version: number, cases: Record<string, unknown> }
  if (typeof data.version === 'number') {
    const cases =
      data.cases && typeof data.cases === 'object' && !Array.isArray(data.cases)
        ? (data.cases as Record<string, unknown>)
        : {};

    // Future version migrations can be chained here (e.g. if (data.version < 2) { ... })
    return cases;
  }

  // Legacy format 1: Single case object { caseId: 'case-1', ... }
  if ('caseId' in data && typeof data.caseId === 'string') {
    return { [data.caseId]: data };
  }

  // Legacy format 2: Unversioned dictionary of cases { 'case-1': {...}, 'case-2': {...} }
  const legacyCases: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (key === 'version') continue;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      legacyCases[key] = val;
    }
  }

  return legacyCases;
}

export function loadAllProgress(): Record<string, CaseProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const rawRecords = migrateStorageData(parsed);

    const sanitized: Record<string, CaseProgress> = {};
    for (const [key, item] of Object.entries(rawRecords)) {
      try {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          // Unknown or corrupt data for this case -> reset only this case
          sanitized[key] = getInitialProgress(key);
          continue;
        }

        const rawItem = item as Record<string, any>;
        const validStatus =
          rawItem.status === 'solved' || rawItem.status === 'in_progress' || rawItem.status === 'unsolved'
            ? rawItem.status
            : 'unsolved';

        sanitized[key] = {
          ...getInitialProgress(key),
          ...rawItem,
          caseId: typeof rawItem.caseId === 'string' && rawItem.caseId ? rawItem.caseId : key,
          status: validStatus,
          markings:
            rawItem.markings && typeof rawItem.markings === 'object' && !Array.isArray(rawItem.markings)
              ? rawItem.markings
              : {},
          markingColors:
            rawItem.markingColors && typeof rawItem.markingColors === 'object' && !Array.isArray(rawItem.markingColors)
              ? rawItem.markingColors
              : {},
          checkedClues: Array.isArray(rawItem.checkedClues) ? rawItem.checkedClues : [],
          notes: typeof rawItem.notes === 'string' ? rawItem.notes : '',
          elapsedSeconds:
            typeof rawItem.elapsedSeconds === 'number' && !isNaN(rawItem.elapsedSeconds) && isFinite(rawItem.elapsedSeconds)
              ? Math.max(0, rawItem.elapsedSeconds)
              : 0,
        };
      } catch (caseErr) {
        console.warn(`Corrupt data for case "${key}". Resetting only this case:`, caseErr);
        sanitized[key] = getInitialProgress(key);
      }
    }

    return sanitized;
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return {};
  }
}

type SaveListener = () => void;
const saveListeners: Set<SaveListener> = new Set();

export function onProgressSaved(listener: SaveListener): () => void {
  saveListeners.add(listener);
  return () => {
    saveListeners.delete(listener);
  };
}

function notifySaveListeners(): void {
  saveListeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.warn('Error in save listener:', err);
    }
  });
}

function getMeaningfulSignature(data: Record<string, CaseProgress>): string {
  try {
    return Object.entries(data)
      .map(([id, p]) => `${id}:${p.status}:${p.notes}:${p.checkedClues?.length || 0}:${p.cooldownUntil || 0}:${Object.keys(p.markings || {}).length}:${p.activeMarkColor || ''}`)
      .join('|');
  } catch {
    return '';
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingSaveData: Record<string, CaseProgress> | null = null;
let lastMeaningfulSignature = '';

export function saveAllProgress(data: Record<string, CaseProgress>, immediate = false): void {
  pendingSaveData = data;

  const currentSig = getMeaningfulSignature(data);
  const isMeaningfulChange = immediate || (currentSig !== '' && currentSig !== lastMeaningfulSignature);

  const performSave = () => {
    if (!pendingSaveData) return;
    try {
      const payload = {
        version: STORAGE_VERSION,
        cases: pendingSaveData,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (isMeaningfulChange) {
        lastMeaningfulSignature = currentSig;
        notifySaveListeners();
      }
    } catch (e) {
      console.warn('Failed to save progress to localStorage (quota or private mode):', e);
    }
    saveTimeout = null;
  };

  if (immediate) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    performSave();
  } else {
    if (!saveTimeout) {
      saveTimeout = setTimeout(performSave, 500);
    }
  }
}

export function getCaseProgress(caseId: string): CaseProgress {
  const all = loadAllProgress();
  if (all[caseId]) {
    return all[caseId];
  }
  const init = getInitialProgress(caseId);
  all[caseId] = init;
  saveAllProgress(all, true);
  return init;
}

export function saveCaseProgress(
  caseId: string,
  updater: (prev: CaseProgress) => CaseProgress
): CaseProgress {
  const all = loadAllProgress();
  const current = all[caseId] || getInitialProgress(caseId);
  const updated = updater(current);
  all[caseId] = updated;
  saveAllProgress(all, true);
  return updated;
}

export function formatTime(seconds: number | null | undefined): string {
  const s = typeof seconds === 'number' && !isNaN(seconds) && isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0;

  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export { COOLDOWN_DURATION_MS };

