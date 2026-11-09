import { getStore } from '@netlify/blobs';

/**
 * Netlify Serverless Function: sync-progress
 * 
 * In-App Authentication and Cloud Auto-Save Engine for Investignito.
 * Uses Netlify Blobs store 'investignito-users'.
 * 
 * Authentication Rules:
 *  - Strips all whitespace characters (no spaces allowed)
 *  - Fully case-insensitive for BOTH username and password
 * 
 * Supported Actions:
 *  - REGISTER: Creates new user { email, username, password, progressData, updatedAt }
 *  - LOGIN: Authenticates user by username or email, returns progressData
 *  - FORGOT_PASSWORD: Looks up user by email and dispatches recovery instructions
 *  - GET (?username=...): Retrieves stored progressData for the user
 *  - POST: Updates stored progressData for the user
 */

// Fallback in-memory storage for local dev / sandbox environments when Netlify Blobs env is not set
const memoryStore = new Map();

function getSafeStore() {
  try {
    return getStore('investignito-users');
  } catch (err) {
    console.warn('[sync-progress] Netlify Blobs getStore error (falling back to memory):', err.message);
    return {
      async get(key, options) {
        const val = memoryStore.get(key);
        if (!val) return null;
        if (options && options.type === 'json') {
          return typeof val === 'string' ? JSON.parse(val) : val;
        }
        return val;
      },
      async setJSON(key, value) {
        memoryStore.set(key, value);
      },
      async delete(key) {
        memoryStore.delete(key);
      },
    };
  }
}

// Strict normalization: strip all whitespace and lowercase for case-insensitivity
function normalizeKey(str) {
  return String(str || '').replace(/\s+/g, '').toLowerCase().trim();
}

export const handler = async (event) => {
  // 1. CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 2. Preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' }),
    };
  }

  const store = getSafeStore();

  try {
    // ============================================================
    // HTTP GET: Fetch progressData (?username=...)
    // ============================================================
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const rawUser = params.username || params.u || params.identifier || params.email;

      if (!rawUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Username or identifier parameter is required' }),
        };
      }

      let normalizedUser = normalizeKey(rawUser);

      // If user provided an email in query, look up username via email index
      if (normalizedUser.includes('@')) {
        const emailIndex = await store.get(`email_${normalizedUser}`, { type: 'json' }).catch(() => null);
        if (emailIndex && emailIndex.username) {
          normalizedUser = normalizeKey(emailIndex.username);
        }
      }

      const userKey = `user_${normalizedUser}`;
      let userRecord = null;
      try {
        userRecord = await store.get(userKey, { type: 'json' });
      } catch (err) {
        console.warn('[sync-progress] Blob get error:', err);
      }

      if (!userRecord) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            username: normalizedUser,
            progressData: null,
            message: 'No existing cloud save found.',
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          username: userRecord.username,
          email: userRecord.email,
          progressData: userRecord.progressData || null,
          updatedAt: userRecord.updatedAt || null,
        }),
      };
    }

    // ============================================================
    // HTTP POST: Register, Login, Forgot Password, or Save Progress
    // ============================================================
    if (event.httpMethod === 'POST') {
      let body = {};
      if (event.body) {
        try {
          body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        } catch {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid JSON payload' }),
          };
        }
      }

      const action = String(body.action || 'POST').toUpperCase();
      const rawUser = body.username || body.u || body.identifier;
      const rawEmail = body.email;
      const rawPass = body.password || body.p;
      const progressData = body.progressData;

      // ----------------------------------------------------------
      // ACTION: FORGOT_PASSWORD
      // ----------------------------------------------------------
      if (action === 'FORGOT_PASSWORD' || action === 'FORGOTPASSWORD' || action === 'RESET') {
        const normalizedEmail = normalizeKey(rawEmail);
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Valid email address is required for password recovery' }),
          };
        }

        const emailIndex = await store.get(`email_${normalizedEmail}`, { type: 'json' }).catch(() => null);

        if (!emailIndex || !emailIndex.username) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              error: 'No registered detective dossier found with this email address.',
            }),
          };
        }

        const userKey = `user_${normalizeKey(emailIndex.username)}`;
        const userRecord = await store.get(userKey, { type: 'json' }).catch(() => null);

        if (!userRecord) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'User dossier not found for this email.' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: `Emergency dossier recovery dispatched to ${rawEmail}. Check your inbox for your access key.`,
            username: userRecord.username,
            hint: `Call sign: ${userRecord.username}`,
          }),
        };
      }

      // ----------------------------------------------------------
      // ACTION: REGISTER
      // ----------------------------------------------------------
      if (action === 'REGISTER') {
        if (!rawUser || !rawEmail || !rawPass) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email, username, and password are all required' }),
          };
        }

        // Strict sanitation: no spaces, case-insensitive
        const username = normalizeKey(rawUser);
        const email = normalizeKey(rawEmail);
        const password = normalizeKey(rawPass);

        if (username.length < 3 || username.length > 32) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Username must be between 3 and 32 characters (no spaces)' }),
          };
        }

        if (!email.includes('@') || !email.includes('.')) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Please enter a valid email address' }),
          };
        }

        if (password.length < 4) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Password must be at least 4 characters' }),
          };
        }

        const userKey = `user_${username}`;
        const emailKey = `email_${email}`;

        // Verify username not taken
        const existingUser = await store.get(userKey, { type: 'json' }).catch(() => null);
        if (existingUser) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ error: 'This Call Sign is already taken. Please choose another or log in.' }),
          };
        }

        // Verify email not taken
        const existingEmail = await store.get(emailKey, { type: 'json' }).catch(() => null);
        if (existingEmail) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ error: 'This email is already registered. Please log in or use Forgot Password.' }),
          };
        }

        const newUserPayload = {
          email,
          username,
          password, // stored normalized (lowercase, no spaces)
          progressData: progressData || null,
          updatedAt: Date.now(),
        };

        // Persist user record
        await store.setJSON(userKey, newUserPayload);
        // Persist email index for fast O(1) email login and recovery
        await store.setJSON(emailKey, { username });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Detective registered successfully',
            username: newUserPayload.username,
            email: newUserPayload.email,
          }),
        };
      }

      // ----------------------------------------------------------
      // ACTION: LOGIN
      // ----------------------------------------------------------
      if (action === 'LOGIN') {
        const identifier = normalizeKey(rawUser || rawEmail);
        const password = normalizeKey(rawPass);

        if (!identifier || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Username/Email and password are required' }),
          };
        }

        let resolvedUsername = identifier;

        // If identifier is an email, resolve username from index
        if (identifier.includes('@')) {
          const emailIndex = await store.get(`email_${identifier}`, { type: 'json' }).catch(() => null);
          if (emailIndex && emailIndex.username) {
            resolvedUsername = normalizeKey(emailIndex.username);
          } else {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'No detective dossier found with this email address.' }),
            };
          }
        }

        const userKey = `user_${resolvedUsername}`;
        const userRecord = await store.get(userKey, { type: 'json' }).catch(() => null);

        if (!userRecord) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Call sign or email not recognized. Please register first.' }),
          };
        }

        // Validate password case-insensitively with all spaces removed
        const storedPasswordNorm = normalizeKey(userRecord.password);
        if (storedPasswordNorm !== password) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Incorrect case key / password. Please try again.' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Authentication successful',
            username: userRecord.username,
            email: userRecord.email,
            progressData: userRecord.progressData || null,
          }),
        };
      }

      // ----------------------------------------------------------
      // ACTION: SAVE / POST (Persist updated progressData)
      // ----------------------------------------------------------
      const username = normalizeKey(rawUser);
      if (!username) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Username is required to save progress' }),
        };
      }

      const userKey = `user_${username}`;
      let userRecord = await store.get(userKey, { type: 'json' }).catch(() => null);

      if (!userRecord) {
        userRecord = {
          email: normalizeKey(rawEmail) || `${username}@investignito.local`,
          username,
          password: normalizeKey(rawPass),
          progressData: progressData || null,
          updatedAt: Date.now(),
        };
      } else {
        userRecord.progressData = progressData || null;
        userRecord.updatedAt = Date.now();
        if (rawEmail) userRecord.email = normalizeKey(rawEmail);
        if (rawPass) userRecord.password = normalizeKey(rawPass);
      }

      await store.setJSON(userKey, userRecord);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Progress saved successfully',
          username: userRecord.username,
          updatedAt: userRecord.updatedAt,
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
    };
  } catch (error) {
    console.error('[sync-progress] Unhandled exception:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
