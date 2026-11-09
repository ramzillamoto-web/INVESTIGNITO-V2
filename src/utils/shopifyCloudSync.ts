/**
 * Shopify Customer Cloud Synchronization Module
 * 
 * Extracts authenticated Shopify customer credentials passed via iframe query parameters
 * (?cid=...&token=...) and provides cloud save/load capabilities via Netlify serverless functions.
 * 
 * Standalone ES6+ module with zero external dependencies.
 */

const STORAGE_KEYS = {
  CID: 'inv_cid',
  TOKEN: 'inv_token',
};

const SYNC_ENDPOINT = '/.netlify/functions/sync-progress';

/**
 * Interface for Customer Credentials
 */
export interface CustomerAuth {
  customerId: string;
  token: string;
}

/**
 * 1. URL Parameter Extraction & Storage
 * Extracts 'cid' and 'token' from window.location.search.
 * Persists them to sessionStorage (and mirrors to localStorage for longevity).
 * Falls back to stored credentials if not present in the current URL.
 */
export function getCustomerAuth(): CustomerAuth | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCid = urlParams.get('cid');
    const urlToken = urlParams.get('token');

    // If new credentials arrived via URL, persist them immediately
    if (urlCid && urlToken) {
      const sanitizedCid = urlCid.trim();
      const sanitizedToken = urlToken.trim();

      try {
        sessionStorage.setItem(STORAGE_KEYS.CID, sanitizedCid);
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, sanitizedToken);
        // Also mirror to localStorage so progress stays linked across browser restarts
        localStorage.setItem(STORAGE_KEYS.CID, sanitizedCid);
        localStorage.setItem(STORAGE_KEYS.TOKEN, sanitizedToken);
      } catch (err) {
        console.warn('[CloudSync] Storage write warning:', err);
      }

      return { customerId: sanitizedCid, token: sanitizedToken };
    }

    // Fall back to sessionStorage, then localStorage
    const storedCid =
      sessionStorage.getItem(STORAGE_KEYS.CID) ||
      localStorage.getItem(STORAGE_KEYS.CID);
    const storedToken =
      sessionStorage.getItem(STORAGE_KEYS.TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (storedCid && storedToken) {
      return { customerId: storedCid, token: storedToken };
    }
  } catch (err) {
    console.warn('[CloudSync] Failed to read credentials:', err);
  }

  return null;
}

/**
 * Checks whether cloud sync is active for the current user
 */
export function isCloudSyncEnabled(): boolean {
  return getCustomerAuth() !== null;
}

/**
 * Clears stored credentials (e.g. on customer logout or 401 Unauthorized)
 */
export function clearCustomerAuth(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.CID);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CID);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (err) {
    console.warn('[CloudSync] Failed to clear credentials:', err);
  }
}

/**
 * 2. Cloud Save Function
 * Sends user game progress to the Netlify serverless function.
 * 
 * @param progressData - The game state object to persist
 * @returns Object indicating success or failure status
 */
export async function saveUserProgress(progressData: any): Promise<{
  success: boolean;
  status?: number;
  message?: string;
  data?: any;
}> {
  const auth = getCustomerAuth();

  if (!auth) {
    console.warn('Cloud save unavailable: Guest mode');
    return { success: false, message: 'Cloud save unavailable: Guest mode' };
  }

  const payload = {
    customerId: auth.customerId,
    token: auth.token,
    progressData,
    timestamp: Date.now(),
  };

  try {
    const response = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: true, status: response.status, data };
    }

    if (response.status === 401) {
      console.warn('[CloudSync] Cloud save rejected: 401 Unauthorized. Token may be expired or invalid.');
      return {
        success: false,
        status: 401,
        message: 'Invalid or expired customer authentication token.',
      };
    }

    if (response.status >= 500) {
      console.error(`[CloudSync] Server error during save: ${response.status} ${response.statusText}`);
      return {
        success: false,
        status: response.status,
        message: 'Server error while saving progress. Please try again later.',
      };
    }

    console.warn(`[CloudSync] Unexpected response status: ${response.status}`);
    return {
      success: false,
      status: response.status,
      message: `Failed to save progress (${response.status})`,
    };
  } catch (error: any) {
    console.error('[CloudSync] Network or connection error saving progress:', error);
    return {
      success: false,
      status: 0,
      message: error?.message || 'Network error saving progress',
    };
  }
}

/**
 * 3. Cloud Load Function
 * Fetches stored user save state from the Netlify serverless function.
 * 
 * @returns The parsed user save state object, or null if unavailable
 */
export async function loadUserProgress(): Promise<any | null> {
  const auth = getCustomerAuth();

  if (!auth) {
    console.warn('[CloudSync] Cloud load skipped: Guest mode');
    return null;
  }

  const queryUrl = `${SYNC_ENDPOINT}?cid=${encodeURIComponent(
    auth.customerId
  )}&token=${encodeURIComponent(auth.token)}`;

  try {
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      // Returns the progressData object stored in the cloud database
      return result.progressData || result;
    }

    if (response.status === 404) {
      // Normal for new players who haven't saved progress yet
      return null;
    }

    if (response.status === 401) {
      console.warn('[CloudSync] Cloud load rejected: 401 Unauthorized.');
      return null;
    }

    if (response.status >= 500) {
      console.error(`[CloudSync] Server error during load: ${response.status}`);
      return null;
    }

    console.warn(`[CloudSync] Unexpected response status on load: ${response.status}`);
    return null;
  } catch (error) {
    console.error('[CloudSync] Network error loading user progress:', error);
    return null;
  }
}
