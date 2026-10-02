import { CaseProgress } from '../types';

const STORAGE_KEY = 'thornbury_case_1_progress_v2';
const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes cooldown

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

export function loadAllProgress(): Record<string, CaseProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const rawRecords: Record<string, any> =
      'caseId' in parsed && typeof parsed.caseId === 'string'
        ? { [parsed.caseId]: parsed }
        : parsed;

    const sanitized: Record<string, CaseProgress> = {};
    for (const [key, item] of Object.entries(rawRecords)) {
      if (!item || typeof item !== 'object') continue;
      sanitized[key] = {
        ...getInitialProgress(key),
        ...item,
        markings: item.markings && typeof item.markings === 'object' && !Array.isArray(item.markings) ? item.markings : {},
        markingColors: item.markingColors && typeof item.markingColors === 'object' ? item.markingColors : {},
        checkedClues: Array.isArray(item.checkedClues) ? item.checkedClues : [],
        notes: typeof item.notes === 'string' ? item.notes : '',
        elapsedSeconds: typeof item.elapsedSeconds === 'number' && !isNaN(item.elapsedSeconds) ? item.elapsedSeconds : 0,
      };
    }

    return sanitized;
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return {};
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingSaveData: Record<string, CaseProgress> | null = null;

export function saveAllProgress(data: Record<string, CaseProgress>, immediate = false): void {
  pendingSaveData = data;

  const performSave = () => {
    if (!pendingSaveData) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingSaveData));
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
