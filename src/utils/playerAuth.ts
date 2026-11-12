/**
 * In-App Detective Authentication & Cloud Save Client
 * 
 * Manages player authentication with Netlify Serverless Functions and Netlify Blobs.
 * Persists session in localStorage under 'inv_user_session'.
 * 
 * Rules:
 *  - Strips all whitespace characters (no spaces allowed)
 *  - Case-insensitive for both username and password
 */

export const SESSION_STORAGE_KEY = 'inv_user_session';
export const SYNC_ENDPOINT = '/.netlify/functions/sync-progress';

/**
 * Master Detective Credentials (Encrypted SHA-256)
 * Username: ramazan
 * Password (SHA-256 of 'cloudsian123'): b183ccab8af24557c50f1ebab1ff19cc33590aeb788f8b72b1b9835d4d97ba15
 */
export const MASTER_USERNAME = 'ramazan';
export const MASTER_PASSWORD_HASH = 'b183ccab8af24557c50f1ebab1ff19cc33590aeb788f8b72b1b9835d4d97ba15';

export interface UserSession {
  username: string;
  email: string;
  password?: string;
  loggedInAt?: number;
  isMaster?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  username?: string;
  email?: string;
  isMaster?: boolean;
  progressData?: any;
}

export function sanitizeInput(str: string): string {
  return String(str || '').replace(/\s+/g, '').toLowerCase().trim();
}

/**
 * Compute SHA-256 hash in hex format using Web Crypto API
 */
export async function computeSha256Hex(str: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Check if the active session belongs to the master test account
 */
export function isMasterUser(sessionOrUser?: UserSession | string | null): boolean {
  if (!sessionOrUser) return false;
  if (typeof sessionOrUser === 'string') {
    return sanitizeInput(sessionOrUser) === MASTER_USERNAME;
  }
  return (
    sanitizeInput(sessionOrUser.username) === MASTER_USERNAME ||
    Boolean(sessionOrUser.isMaster)
  );
}

/**
 * Retrieve current active user session from localStorage
 */
export function getUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.username === 'string') {
      const cleanUser = sanitizeInput(parsed.username);
      const isMaster = cleanUser === MASTER_USERNAME || Boolean(parsed.isMaster);
      return {
        username: cleanUser,
        email: sanitizeInput(parsed.email || ''),
        password: sanitizeInput(parsed.password || ''),
        loggedInAt: parsed.loggedInAt,
        isMaster,
      };
    }
  } catch (err) {
    console.warn('[PlayerAuth] Failed to parse session:', err);
  }

  return null;
}

/**
 * Save user session to localStorage
 */
export function setUserSession(session: UserSession): void {
  if (typeof window === 'undefined') return;

  try {
    const cleanUser = sanitizeInput(session.username);
    const isMaster = cleanUser === MASTER_USERNAME || Boolean(session.isMaster);
    const payload: UserSession = {
      username: cleanUser,
      email: sanitizeInput(session.email || ''),
      password: sanitizeInput(session.password || ''),
      loggedInAt: session.loggedInAt || Date.now(),
      isMaster,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[PlayerAuth] Failed to save session:', err);
  }
}

/**
 * Clear active session on logout
 */
export function clearUserSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('[PlayerAuth] Failed to clear session:', err);
  }
}

/**
 * Check if player has an active session
 */
export function isUserLoggedIn(): boolean {
  return getUserSession() !== null;
}

// Backward-compatible aliases
export const getPlayerSession = getUserSession;
export const setPlayerSession = setUserSession;
export const clearPlayerSession = clearUserSession;
export const isPlayerLoggedIn = isUserLoggedIn;
export type PlayerCredentials = UserSession;

/**
 * Register a new Detective Account (Case-insensitive & no spaces)
 */
export async function registerUser(
  email: string,
  username: string,
  password: string,
  initialProgress?: any
): Promise<AuthResponse> {
  const cleanEmail = sanitizeInput(email);
  const cleanUser = sanitizeInput(username);
  const cleanPass = sanitizeInput(password);

  // Check Master Detective Credentials via encrypted SHA-256
  if (cleanUser === MASTER_USERNAME) {
    const inputHash = await computeSha256Hex(cleanPass);
    if (inputHash === MASTER_PASSWORD_HASH) {
      const masterSession: UserSession = {
        username: MASTER_USERNAME,
        email: cleanEmail || 'payerbol@gmail.com',
        password: cleanPass,
        isMaster: true,
        loggedInAt: Date.now(),
      };
      setUserSession(masterSession);

      // Best-effort background sync
      fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER',
          email: masterSession.email,
          username: MASTER_USERNAME,
          password: cleanPass,
          progressData: initialProgress || null,
        }),
      }).catch(() => {});

      return {
        success: true,
        message: 'Master Detective Clearance Issued! All cases unlocked for testing.',
        username: MASTER_USERNAME,
        email: masterSession.email,
        isMaster: true,
        progressData: initialProgress || null,
      };
    }
  }

  try {
    const res = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'REGISTER',
        email: cleanEmail,
        username: cleanUser,
        password: cleanPass,
        progressData: initialProgress || null,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      const isMaster = cleanUser === MASTER_USERNAME || Boolean(data.isMaster);
      const session: UserSession = {
        username: sanitizeInput(data.username || cleanUser),
        email: sanitizeInput(data.email || cleanEmail),
        password: cleanPass,
        isMaster,
      };
      setUserSession(session);
      return {
        success: true,
        message: data.message || 'Detective badge registered successfully!',
        username: session.username,
        email: session.email,
        isMaster,
        progressData: initialProgress || null,
      };
    }

    return {
      success: false,
      message: data.error || 'Registration failed. Please check your inputs.',
    };
  } catch (err: any) {
    console.error('[PlayerAuth] Register network error:', err);
    return {
      success: false,
      message: 'Network connection error. Please try again.',
    };
  }
}

/**
 * Log in using Username OR Email and Password (Case-insensitive & no spaces)
 */
export async function loginUser(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  const cleanId = sanitizeInput(identifier);
  const cleanPass = sanitizeInput(password);

  // Check Master Detective Credentials via encrypted SHA-256
  const isMasterTarget =
    cleanId === MASTER_USERNAME ||
    cleanId === 'payerbol@gmail.com' ||
    cleanId === 'ramazan@investignito.master' ||
    cleanId === 'ramazan@corexbooks.com';

  if (isMasterTarget) {
    const inputHash = await computeSha256Hex(cleanPass);
    if (inputHash === MASTER_PASSWORD_HASH) {
      const masterSession: UserSession = {
        username: MASTER_USERNAME,
        email: cleanId.includes('@') ? cleanId : 'payerbol@gmail.com',
        password: cleanPass,
        isMaster: true,
        loggedInAt: Date.now(),
      };
      setUserSession(masterSession);

      let cloudProgress: any = null;
      try {
        cloudProgress = await fetchUserProgress(MASTER_USERNAME);
      } catch {
        // Dev offline fallback
      }

      return {
        success: true,
        message: 'Master Detective Clearance Verified! All cases unlocked for testing.',
        username: MASTER_USERNAME,
        email: masterSession.email,
        isMaster: true,
        progressData: cloudProgress || null,
      };
    }
  }

  try {
    const res = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOGIN',
        identifier: cleanId,
        username: cleanId,
        password: cleanPass,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      const resolvedUser = sanitizeInput(data.username || cleanId);
      const isMaster = resolvedUser === MASTER_USERNAME || Boolean(data.isMaster);
      const session: UserSession = {
        username: resolvedUser,
        email: sanitizeInput(data.email || (cleanId.includes('@') ? cleanId : '')),
        password: cleanPass,
        isMaster,
      };
      setUserSession(session);
      return {
        success: true,
        message: data.message || 'Access granted! Dossier synchronized.',
        username: session.username,
        email: session.email,
        isMaster,
        progressData: data.progressData || null,
      };
    }

    return {
      success: false,
      message: data.error || 'Invalid credentials. Please verify your call sign/email and password.',
    };
  } catch (err: any) {
    console.error('[PlayerAuth] Login network error:', err);
    return {
      success: false,
      message: 'Network connection error. Please try again.',
    };
  }
}

/**
 * Request password recovery email
 */
export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  const cleanEmail = sanitizeInput(email);

  try {
    const res = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'FORGOT_PASSWORD',
        email: cleanEmail,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || `Recovery instructions dispatched to ${cleanEmail}.`,
      };
    }

    return {
      success: false,
      message: data.error || 'Could not locate account with this email address.',
    };
  } catch (err: any) {
    console.error('[PlayerAuth] Password reset network error:', err);
    return {
      success: false,
      message: 'Network connection error. Please try again.',
    };
  }
}

/**
 * Fetch stored cloud progress for a user
 */
export async function fetchUserProgress(username: string): Promise<any | null> {
  const cleanUser = sanitizeInput(username);
  if (!cleanUser) return null;

  try {
    const res = await fetch(`${SYNC_ENDPOINT}?username=${encodeURIComponent(cleanUser)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.progressData || null;
    }

    return null;
  } catch (err) {
    console.error('[PlayerAuth] Fetch progress network error:', err);
    return null;
  }
}

/**
 * Persist cloud progress to Netlify
 */
export async function sendCloudSave(
  username: string,
  email: string,
  password: string | undefined,
  progressData: any
): Promise<{ success: boolean; message?: string }> {
  const cleanUser = sanitizeInput(username);
  if (!cleanUser) return { success: false, message: 'Missing username' };

  try {
    const res = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'POST',
        username: cleanUser,
        email: sanitizeInput(email || ''),
        password: sanitizeInput(password || ''),
        progressData,
      }),
    });

    if (res.ok) {
      return { success: true };
    }

    return { success: false, message: 'Cloud save rejected' };
  } catch (err) {
    console.error('[PlayerAuth] Cloud save network error:', err);
    return { success: false, message: 'Network error' };
  }
}

// Backward-compatible wrappers for load/save
export async function loadPlayerProgress(): Promise<any | null> {
  const session = getUserSession();
  if (!session) return null;
  return fetchUserProgress(session.username);
}

export async function savePlayerProgress(progressData: any): Promise<{ success: boolean; message?: string }> {
  const session = getUserSession();
  if (!session) return { success: false, message: 'No active session' };
  return sendCloudSave(session.username, session.email, session.password, progressData);
}

export const registerPlayer = registerUser;
export const loginPlayer = loginUser;
