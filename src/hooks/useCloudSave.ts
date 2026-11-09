import { useEffect, useRef, useState, useCallback } from 'react';
import { UserSession, fetchUserProgress, sendCloudSave } from '../utils/playerAuth';
import { CaseProgress } from '../types';
import { saveAllProgress } from '../utils/storage';
import { applyCaseVersionResets } from '../utils/caseVersions';

interface UseCloudSaveOptions {
  userSession: UserSession | null;
  allProgress: Record<string, CaseProgress>;
  setAllProgress: React.Dispatch<React.SetStateAction<Record<string, CaseProgress>>>;
  onSaveNotification?: () => void;
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

  const isCloudLoadedRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const allProgressRef = useRef<Record<string, CaseProgress>>(allProgress);
  allProgressRef.current = allProgress;

  const userSessionRef = useRef<UserSession | null>(userSession);
  userSessionRef.current = userSession;

  // Track serialized progress to avoid redundant network calls if nothing changed
  const lastSavedJsonRef = useRef<string>('');

  // 1. Initial Load: On mount or when user logs in
  useEffect(() => {
    let isCancelled = false;

    async function initialCloudFetch() {
      if (!userSession) {
        // If not logged in, cloud is considered "ready" (local only)
        isCloudLoadedRef.current = true;
        setIsCloudLoaded(true);
        return;
      }

      try {
        console.log(`[CloudSave] Fetching cloud dossier for ${userSession.username}...`);
        const cloudData = await fetchUserProgress(userSession.username);

        if (isCancelled) return;

        if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
          console.log('[CloudSave] Cloud save found. Applying to local game state...');
          const { updated } = applyCaseVersionResets(cloudData);
          setAllProgress(updated);
          saveAllProgress(updated, true);
          lastSavedJsonRef.current = JSON.stringify(updated);
          if (onSaveNotification) onSaveNotification();
        } else {
          console.log('[CloudSave] No prior cloud save found. Uploading current state as baseline...');
          lastSavedJsonRef.current = '';
          // Send current state as initial baseline save
          sendCloudSave(
            userSession.username,
            userSession.email,
            userSession.password,
            allProgressRef.current
          ).then(() => {
            lastSavedJsonRef.current = JSON.stringify(allProgressRef.current);
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('[CloudSave] Failed initial cloud load:', err);
      } finally {
        if (!isCancelled) {
          isCloudLoadedRef.current = true;
          setIsCloudLoaded(true);
        }
      }
    }

    // Reset cloud loaded gate on user switch
    isCloudLoadedRef.current = false;
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
      // LOCK AUTO-SAVE: Strict lock until initial cloud load succeeds
      if (!isCloudLoadedRef.current || !activeSession) {
        return false;
      }

      if (isSavingRef.current) return false;

      const progressToSave = overrideProgress || allProgressRef.current;
      const currentJson = JSON.stringify(progressToSave);

      // Skip save if identical to last saved state unless force is true
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

        if (res.success) {
          lastSavedJsonRef.current = currentJson;
          setLastSavedTime(Date.now());
          if (onSaveNotification) onSaveNotification();
          return true;
        }
      } catch (err) {
        console.warn('[CloudSave] Error during save:', err);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }

      return false;
    },
    [onSaveNotification]
  );

  // 2. Auto-Save Loop: 5-second interval timer
  useEffect(() => {
    if (!userSession || !isCloudLoaded) return;

    const intervalTimer = setInterval(() => {
      executeSave();
    }, 5000);

    return () => clearInterval(intervalTimer);
  }, [userSession, isCloudLoaded, executeSave]);

  // 3. Immediate saves on visibilitychange / pagehide / beforeunload
  useEffect(() => {
    const handleImmediateSave = () => {
      if (!isCloudLoadedRef.current || !userSessionRef.current) return;
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

  // Immediate save trigger exposed to parent (e.g. for case completions, scene submissions)
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
