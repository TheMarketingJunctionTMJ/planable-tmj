import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sql } from '../../lib/db.js';

// Check if database is configured
const hasDatabase = !!process.env.POSTGRES_URL;

/**
 * LinkedIn Data Deletion Callback
 *
 * This endpoint handles data deletion requests from LinkedIn when a user
 * revokes access to your application from LinkedIn's settings.
 *
 * LinkedIn will POST a signed request to this endpoint. You must:
 * 1. Verify the request signature
 * 2. Delete the user's data
 * 3. Return a confirmation URL
 *
 * For more info: https://learn.microsoft.com/en-us/linkedin/shared/api-guide/webhook-validation
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://planable-tmj.vercel.app';
  const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  try {
    // Parse the request body
    const { user_id, signed_request } = req.body;

    // Log incoming request for debugging
    console.log('[LinkedIn Data Deletion] Received callback:', {
      user_id,
      has_signed_request: !!signed_request,
      body: req.body
    });

    // If this is a verification request from LinkedIn (GET or no body)
    if (!signed_request && !user_id) {
      // LinkedIn sometimes sends a simple challenge verification
      if (req.query.hub_mode === 'subscribe' && req.query.hub_challenge) {
        return res.status(200).send(req.query.hub_challenge);
      }
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify signed request if provided
    if (signed_request && linkedInClientSecret) {
      const [encodedSig, payload] = signed_request.split('.');

      if (encodedSig && payload) {
        const expectedSig = crypto
          .createHmac('sha256', linkedInClientSecret)
          .update(payload)
          .digest('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        if (encodedSig !== expectedSig) {
          console.error('[LinkedIn Data Deletion] Invalid signature');
          return res.status(401).json({ error: 'Invalid signature' });
        }

        // Decode payload to get user info
        const decodedPayload = JSON.parse(
          Buffer.from(payload, 'base64').toString('utf8')
        );
        console.log('[LinkedIn Data Deletion] Verified payload:', decodedPayload);
      }
    }

    // LinkedIn member ID from the request
    const linkedInUserId = user_id || req.body.member_id;

    if (!linkedInUserId) {
      console.error('[LinkedIn Data Deletion] No user ID provided');
      return res.status(400).json({ error: 'No user ID provided' });
    }

    // Delete user data
    if (hasDatabase) {
      // Find and delete the social account for this LinkedIn user
      const result = await sql`
        DELETE FROM social_accounts
        WHERE platform = 'linkedin' AND platform_user_id = ${linkedInUserId}
        RETURNING user_id
      `;

      if (result.rows.length > 0) {
        console.log(`[LinkedIn Data Deletion] Deleted LinkedIn account for platform user ${linkedInUserId}`);

        // Optionally delete all user data if this was their only social account
        // For now, we just remove the LinkedIn connection
      } else {
        console.log(`[LinkedIn Data Deletion] No account found for LinkedIn user ${linkedInUserId}`);
      }
    } else {
      console.log(`[Mock Mode] Would delete LinkedIn account for user: ${linkedInUserId}`);
    }

    // Generate a confirmation code for tracking
    const confirmationCode = crypto.randomBytes(16).toString('hex');

    // Return the required response format for LinkedIn
    // LinkedIn expects a JSON response with a confirmation_url
    return res.status(200).json({
      url: `${appUrl}/api/data-deletion/confirm?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
      status: 'deleted'
    });
  } catch (error) {
    console.error('[LinkedIn Data Deletion] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
