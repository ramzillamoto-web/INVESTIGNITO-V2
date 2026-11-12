import { useEffect, useRef, useState, useCallback } from 'react';
import { UserSession, fetchUserProgress, sendCloudSave } from '../utils/playerAuth';
import { CaseProgress, SuspectMarking, MarkingColor } from '../types';
import { saveAllProgress, mergeCaseProgress } from '../utils/storage';
import { applyCaseVersionResets } from '../utils/caseVersions';

interface UseCloudSaveOptions {
  userSession: UserSession | null;
  allProgress: Record<string, CaseProgress>;
  setAllProgress: React.Dispatch<React.SetStateAction<Record<string, CaseProgress>>>;
  onSaveNotification?: () => void;
}

/**
 * Deeply sanitizes progress data to ensure clean serializability.
 * Strips circular refs, DOM/React event references, and invalid structures
 * so active UI inputs (like text notes) and canvas marks never get wiped out during JSON.stringify.
 */
export function sanitizeProgressData(
  rawData: Record<string, CaseProgress> | null | undefined
): Record<string, CaseProgress> {
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
    return {};
  }

  const clean: Record<string, CaseProgress> = {};
  const VALID_COLORS: MarkingColor[] = ['pink', 'red', 'green', 'yellow', 'blue', 'orange'];

  for (const [key, val] of Object.entries(rawData)) {
    if (!val || typeof val !== 'object' || Array.isArray(val)) continue;

    // Sanitize markings to ensure strictly 'none' | 'cross' | 'circle'
    const cleanMarkings: Record<string, SuspectMarking> = {};
    if (val.markings && typeof val.markings === 'object' && !Array.isArray(val.markings)) {
      for (const [mKey, mVal] of Object.entries(val.markings)) {
        if (mVal === 'none' || mVal === 'cross' || mVal === 'circle') {
          cleanMarkings[mKey] = mVal;
        }
      }
    }

    // Sanitize marking colors
    const cleanColors: Record<string, MarkingColor> = {};
    if (val.markingColors && typeof val.markingColors === 'object' && !Array.isArray(val.markingColors)) {
      for (const [cKey, cVal] of Object.entries(val.markingColors)) {
        if (typeof cVal === 'string' && VALID_COLORS.includes(cVal as MarkingColor)) {
          cleanColors[cKey] = cVal as MarkingColor;
        }
      }
    }

    const activeColor: MarkingColor =
      typeof val.activeMarkColor === 'string' && VALID_COLORS.includes(val.activeMarkColor as MarkingColor)
        ? (val.activeMarkColor as MarkingColor)
        : 'red';

    // Sanitize checked clues (number[])
    const cleanClues: number[] = Array.isArray(val.checkedClues)
      ? val.checkedClues
          .map((c) => (typeof c === 'number' ? c : parseInt(String(c), 10)))
          .filter((c): c is number => typeof c === 'number' && !isNaN(c) && isFinite(c))
      : [];

    clean[key] = {
      caseId: typeof val.caseId === 'string' && val.caseId ? val.caseId : key,
      status: val.status === 'solved' || val.status === 'in_progress' ? val.status : 'unsolved',
      elapsedSeconds:
        typeof val.elapsedSeconds === 'number' && isFinite(val.elapsedSeconds)
          ? Math.max(0, val.elapsedSeconds)
          : 0,
      startedAt: typeof val.startedAt === 'number' && isFinite(val.startedAt) ? val.startedAt : null,
      lastActiveAt: typeof val.lastActiveAt === 'number' && isFinite(val.lastActiveAt) ? val.lastActiveAt : null,
      markings: cleanMarkings,
      markingColors: cleanColors,
      activeMarkColor: activeColor,
      cooldownUntil: typeof val.cooldownUntil === 'number' && isFinite(val.cooldownUntil) ? val.cooldownUntil : null,
      solvedAt: typeof val.solvedAt === 'number' && isFinite(val.solvedAt) ? val.solvedAt : null,
      solveTimeSeconds:
        typeof val.solveTimeSeconds === 'number' && isFinite(val.solveTimeSeconds)
          ? val.solveTimeSeconds
          : null,
      incorrectAttempts:
        typeof val.incorrectAttempts === 'number' && isFinite(val.incorrectAttempts)
          ? val.incorrectAttempts
          : 0,
      notes: typeof val.notes === 'string' ? val.notes : '',
      checkedClues: cleanClues,
    };
  }

  return clean;
}

function getProgressMeaningfulSignature(data: Record<string, CaseProgress>): string {
  try {
    return Object.entries(data)
      .map(
        ([id, p]) =>
          `${id}:${p.status}:${p.notes}:${p.checkedClues?.length || 0}:${p.cooldownUntil || 0}:${
            Object.keys(p.markings || {}).length
          }:${p.activeMarkColor || ''}`
      )
      .join('|');
  } catch {
    return '';
  }
}

export function useCloudSave({
  userSession,
  allProgress,
  setAllProgress,
  onSaveNotification,
}: UseCloudSaveOptions) {
  const [isCloudLoaded, setIsCloudLoaded] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<number>(0);

  // 1. Strict Cloud Load Order Flag: guarantees new devices never overwrite cloud with blank state
  const isCloudDataLoaded = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allProgressRef = useRef<Record<string, CaseProgress>>(allProgress);
  allProgressRef.current = allProgress;

  const userSessionRef = useRef<UserSession | null>(userSession);
  userSessionRef.current = userSession;

  // Track serialized progress and signatures to avoid redundant network calls
  const lastSavedJsonRef = useRef<string>('');
  const lastMeaningfulSigRef = useRef<string>(getProgressMeaningfulSignature(allProgress));

  // 1. Initial Load (Prevent Device Overwrite):
  // Perform GET to /.netlify/functions/sync-progress FIRST.
  // ONLY after the GET request completes and populates the game state, set isCloudDataLoaded.current = true.
  useEffect(() => {
    let isCancelled = false;

    async function initialCloudFetch() {
      if (!userSession) {
        // If not logged in, local-only mode is active
        isCloudDataLoaded.current = true;
        setIsCloudLoaded(true);
        return;
      }

      try {
        console.log(`[CloudSave] Performing GET FIRST for ${userSession.username}...`);
        const cloudData = await fetchUserProgress(userSession.username);

        if (isCancelled) return;

        // ONLY after the GET request completes, populate the game state
        if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
          console.log('[CloudSave] Cloud save found. Merging and populating game state...');
          const { updated } = applyCaseVersionResets(cloudData);
          const sanitizedCloud = sanitizeProgressData(updated);

          // Merge cloud data with local progress (cloud takes precedence for non-empty fields)
          const merged = mergeCaseProgress(allProgressRef.current, sanitizedCloud);
          allProgressRef.current = merged;
          setAllProgress(merged);
          saveAllProgress(merged, true);
          lastSavedJsonRef.current = JSON.stringify(merged);
          lastMeaningfulSigRef.current = getProgressMeaningfulSignature(merged);
        } else {
          console.log('[CloudSave] No prior cloud save found. Retaining local state as baseline.');
          const sanitizedLocal = sanitizeProgressData(allProgressRef.current);
          lastSavedJsonRef.current = JSON.stringify(sanitizedLocal);
          lastMeaningfulSigRef.current = getProgressMeaningfulSignature(sanitizedLocal);
        }
      } catch (err) {
        console.warn('[CloudSave] Failed initial cloud GET request:', err);
      } finally {
        if (!isCancelled) {
          // ONLY after GET request completes and populates game state, mark cloud as loaded
          isCloudDataLoaded.current = true;
          setIsCloudLoaded(true);
          console.log('[CloudSave] Initial cloud load finished. Save lock released.');
        }
      }
    }

    // Immediately lock saves whenever user session changes
    isCloudDataLoaded.current = false;
    setIsCloudLoaded(false);
    initialCloudFetch();

    return () => {
      isCancelled = true;
    };
  }, [userSession?.username]);

  // Core save function
  const executeSave = useCallback(
    async (overrideProgress?: Record<string, CaseProgress>, force = false) => {
      const activeSession = userSessionRef.current;

      // STRICT GUARD: Block ALL POST save requests if isCloudDataLoaded.current === false
      // This guarantees a new device will NEVER overwrite existing cloud data with blank state on boot.
      if (!isCloudDataLoaded.current || !activeSession) {
        return false;
      }

      if (isSavingRef.current) return false;

      // Deeply sanitize progressData so active UI inputs/canvas marks are not lost during serialization
      const rawData = overrideProgress || allProgressRef.current;
      const progressToSave = sanitizeProgressData(rawData);
      const currentJson = JSON.stringify(progressToSave);

      // Skip save if identical to last saved state unless explicitly forced
      if (!force && currentJson === lastSavedJsonRef.current) {
        return true;
      }

      try {
        isSavingRef.current = true;
        setIsSaving(true);

        const res = await sendCloudSave(
          activeSession.username,
          activeSession.email,
          activeSession.password,
          progressToSave
        );

        // Crucial: The server response from a POST save request NEVER overwrites or resets local React UI state/inputs.
        // Local UI state remains the single source of truth while playing.
        if (res && res.success) {
          lastSavedJsonRef.current = currentJson;
          lastMeaningfulSigRef.current = getProgressMeaningfulSignature(progressToSave);
          setLastSavedTime(Date.now());
          if (onSaveNotification) onSaveNotification();
          return true;
        }
      } catch (err) {
        console.warn('[CloudSave] Error during cloud save POST:', err);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }

      return false;
    },
    [onSaveNotification]
  );

  // 2. Debounced Auto-Save Mechanism (replaces blind 5-second setInterval):
  // Saves 3 seconds after the last user action, strictly blocked until isCloudDataLoaded.current === true.
  useEffect(() => {
    // Strictly guard: do not trigger auto-save if cloud data hasn't finished loading
    if (!isCloudDataLoaded.current || !userSessionRef.current) return;

    const currentSig = getProgressMeaningfulSignature(allProgress);
    // Only schedule debounced save if there was an actual detective action (notes, marks, clues, status)
    if (currentSig === lastMeaningfulSigRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSave();
    }, 3000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [allProgress, executeSave]);

  // 3. Immediate saves on visibilitychange / pagehide / beforeunload
  useEffect(() => {
    const handleImmediateSave = () => {
      if (!isCloudDataLoaded.current || !userSessionRef.current) return;
      saveAllProgress(allProgressRef.current, true);
      executeSave(allProgressRef.current, true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleImmediateSave();
      }
    };

    window.addEventListener('pagehide', handleImmediateSave);
    window.addEventListener('beforeunload', handleImmediateSave);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pagehide', handleImmediateSave);
      window.removeEventListener('beforeunload', handleImmediateSave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [executeSave]);

  // Immediate save trigger exposed for explicit scene/case completions
  const triggerImmediateSave = useCallback(
    (immediateData?: Record<string, CaseProgress>) => {
      return executeSave(immediateData, true);
    },
    [executeSave]
  );

  return {
    isCloudLoaded,
    isSaving,
    lastSavedTime,
    triggerImmediateSave,
  };
}
