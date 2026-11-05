import { CaseProgress } from '../types';
import { STORAGE_VERSION } from './storage';

const DB_NAME = 'investignito_persistent_db';
const DB_VERSION = 1;
const STORE_NAME = 'game_snapshots';
const BROADCAST_CHANNEL_NAME = 'investignito_sync_bus';

/**
 * Initializes Persistent Storage via the Web Storage API.
 * Prohibits iOS Safari and Android Chrome from purging the site's data during
 * low-disk-space or overnight background cleanup sweeps.
 */
export async function initPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return false;
  }

  try {
    // Check if already granted
    if (navigator.storage.persisted) {
      const isAlreadyPersisted = await navigator.storage.persisted();
      if (isAlreadyPersisted) {
        return true;
      }
    }

    // Request persistent storage from browser engine
    if (navigator.storage.persist) {
      const granted = await navigator.storage.persist();
      return granted;
    }
  } catch (err) {
    // Non-fatal, older browsers or secure context constraints
    console.warn('Persistent storage request failed:', err);
  }

  return false;
}

/**
 * Native IndexedDB helper for secondary disaster-recovery storage.
 */
function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Saves a key-value snapshot directly to IndexedDB.
 */
export async function saveToIndexedDB(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDatabase();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          resolve();
        };
      } catch {
        resolve();
      }
    });
  } catch {
    // Never throw from storage persistence
  }
}

/**
 * Retrieves a key-value snapshot from IndexedDB.
 */
export async function getFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve((req.result as T) ?? null);
        };
        req.onerror = () => resolve(null);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Mirrors full game progress snapshot to IndexedDB.
 */
export async function mirrorProgressToIndexedDB(cases: Record<string, CaseProgress>): Promise<void> {
  if (!cases || typeof cases !== 'object') return;
  const payload = {
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    cases,
  };
  await saveToIndexedDB('all_cases_backup', payload);
}

/**
 * Checks if IndexedDB contains a valid backup and returns it.
 * Used when localStorage has been cleared or lost overnight.
 */
export async function checkAndRecoverFromIndexedDB(): Promise<Record<string, CaseProgress> | null> {
  try {
    const backup = await getFromIndexedDB<{
      version: number;
      timestamp: number;
      cases: Record<string, CaseProgress>;
    }>('all_cases_backup');

    if (backup && backup.cases && typeof backup.cases === 'object' && Object.keys(backup.cases).length > 0) {
      return backup.cases;
    }
  } catch (err) {
    console.warn('Failed reading IndexedDB backup:', err);
  }
  return null;
}

// --------------------------------------------------------------------------
// Multi-Tab & Cross-Window Synchronization (BroadcastChannel + storage events)
// --------------------------------------------------------------------------

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable in some private browsing configurations
  broadcastChannel = null;
}

/**
 * Broadcasts progress updates to any other open tabs in real-time.
 */
export function broadcastProgressUpdate(cases: Record<string, CaseProgress>): void {
  if (!broadcastChannel) return;
  try {
    broadcastChannel.postMessage({
      type: 'PROGRESS_UPDATE',
      timestamp: Date.now(),
      cases,
    });
  } catch {
    // Ignore broadcast errors
  }
}

/**
 * Subscribes to cross-tab progress updates from other tabs/windows.
 */
export function initCrossTabSync(
  onRemoteUpdate: (cases: Record<string, CaseProgress>) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Listen via BroadcastChannel
  const handleBroadcastMessage = (event: MessageEvent) => {
    try {
      if (event.data?.type === 'PROGRESS_UPDATE' && event.data?.cases) {
        onRemoteUpdate(event.data.cases);
      }
    } catch (e) {
      console.warn('Error processing cross-tab broadcast message:', e);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // 2. Fallback: Listen via window 'storage' event for browsers without BroadcastChannel
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'thornbury_case_1_progress_v2' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        const cases = parsed?.cases || parsed;
        if (cases && typeof cases === 'object' && !Array.isArray(cases)) {
          onRemoteUpdate(cases);
        }
      } catch {
        // Ignore parse error
      }
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

// --------------------------------------------------------------------------
// In-App Browser Detection (Instagram, TikTok, Facebook, Twitter, Line, etc.)
// --------------------------------------------------------------------------

/**
 * Detects if the current webpage is loaded inside an In-App WebView.
 * In-app browsers often clear all cookies, IndexedDB, and localStorage
 * when dismissed or overnight.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent || navigator.vendor || '';

  // Common in-app browser user agent signatures
  const inAppRegex = /FBAN|FBAV|Instagram|TikTok|musical_ly|Twitter|Line\/|MicroMessenger|WeChat|Snapchat|GSA\/|LinkedInApp/i;
  if (inAppRegex.test(ua)) {
    return true;
  }

  // iOS-specific WebView detection: iOS device where browser is NOT standard Safari
  const isIosDevice = /iPhone|iPad|iPod/.test(ua);
  const isAppleWebKit = /AppleWebKit/.test(ua);
  const isSafariToken = /Safari/.test(ua);
  const isStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;

  // On iOS, WebViews have AppleWebKit but lack the standalone Safari browser chrome
  if (isIosDevice && isAppleWebKit && !isSafariToken && !isStandalone) {
    return true;
  }

  return false;
}
