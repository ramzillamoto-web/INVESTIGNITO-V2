import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

/**
 * Netlify Serverless Function: sync-progress
 * 
 * Persistent cloud save and load for Shopify customer accounts powered by @netlify/blobs.
 * Verifies HMAC SHA-256 signature against process.env.PROGRESS_SIGNING_SECRET.
 */
export const handler = async (event) => {
  // 1. CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 2. Handle CORS Preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' }),
    };
  }

  try {
    // 3. Read secret from environment
    const secret = process.env.PROGRESS_SIGNING_SECRET;
    if (!secret) {
      console.error('[sync-progress] Missing PROGRESS_SIGNING_SECRET in environment variables.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error: missing signing secret' }),
      };
    }

    let customerId;
    let token;
    let progressData = null;

    // 4. Extract parameters depending on HTTP Method
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      customerId = params.customerId || params.cid;
      token = params.token;
    } else if (event.httpMethod === 'POST') {
      let body = {};
      if (event.body) {
        try {
          body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        } catch (e) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid JSON payload' }),
          };
        }
      }
      customerId = body.customerId || body.cid;
      token = body.token;
      progressData = body.progressData;
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
      };
    }

    // 5. Validate presence of credentials
    if (!customerId || !token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: Missing customerId or token' }),
      };
    }

    // 6. Verify HMAC SHA-256 signature
    const recomputed = crypto
      .createHmac('sha256', secret)
      .update(String(customerId))
      .digest('hex');

    const tokenStr = String(token).trim().toLowerCase();
    const recomputedStr = recomputed.toLowerCase();

    // Constant-time comparison to prevent timing attacks
    const isSignatureValid =
      tokenStr.length === recomputedStr.length &&
      crypto.timingSafeEqual(Buffer.from(tokenStr), Buffer.from(recomputedStr));

    if (!isSignatureValid) {
      console.warn(`[sync-progress] 401 Unauthorized for customerId: ${customerId}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: Invalid token signature' }),
      };
    }

    // 7. Access Netlify Blobs store
    const saves = getStore('user-progress');
    const storageKey = `save_${customerId}`;

    // 8. Handle GET (Retrieve user progress)
    if (event.httpMethod === 'GET') {
      const storedProgress = await saves.get(storageKey, { type: 'json' });

      if (!storedProgress) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            progressData: null,
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          progressData: storedProgress,
        }),
      };
    }

    // 9. Handle POST (Persist user progress)
    if (event.httpMethod === 'POST') {
      await saves.setJSON(storageKey, progressData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Progress saved successfully',
        }),
      };
    }
  } catch (error) {
    console.error('[sync-progress] Server error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
