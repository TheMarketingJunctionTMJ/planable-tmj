import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db.js';

// Check if database is configured
const hasDatabase = !!process.env.POSTGRES_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const appName = process.env.APP_NAME || 'TMJ Social Media Manager';
  const contactEmail = process.env.CONTACT_EMAIL || 'support@themarketingjunctiontmj.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://planable-tmj.vercel.app';

  // Handle GET request - show the data deletion request form
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Deletion Request - ${appName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
      background: #f9fafb;
    }
    h1 {
      color: #111;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    input[type="email"], textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 16px;
      box-sizing: border-box;
    }
    input[type="email"]:focus, textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    button {
      background: #dc2626;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
    }
    button:hover {
      background: #b91c1c;
    }
    .info-box {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 25px;
    }
    .success-box {
      background: #d1fae5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      display: none;
    }
    .error-box {
      background: #fee2e2;
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      display: none;
    }
    a {
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <h1>Data Deletion Request</h1>

  <div class="info-box">
    <strong>What happens when you request data deletion:</strong>
    <ul style="margin-bottom: 0;">
      <li>All your posts and scheduled content will be permanently deleted</li>
      <li>Your connected social media account information will be removed</li>
      <li>Your user profile and preferences will be erased</li>
      <li>This action cannot be undone</li>
    </ul>
  </div>

  <div id="error-message" class="error-box"></div>

  <div id="success-message" class="success-box">
    <h2 style="color: #059669; margin-top: 0;">Request Submitted</h2>
    <p>Your data deletion request has been received. We will process your request within 30 days and send a confirmation to your email address.</p>
    <p><a href="${appUrl}">Return to App</a></p>
  </div>

  <form id="deletion-form">
    <div class="form-group">
      <label for="email">Email Address</label>
      <input type="email" id="email" name="email" required placeholder="Enter the email associated with your account">
    </div>

    <div class="form-group">
      <label for="reason">Reason for Deletion (Optional)</label>
      <textarea id="reason" name="reason" rows="3" placeholder="Tell us why you're deleting your data (optional)"></textarea>
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" id="confirm" required>
        I understand that this action will permanently delete all my data and cannot be undone
      </label>
    </div>

    <button type="submit">Request Data Deletion</button>
  </form>

  <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280;">
    You can also request data deletion by emailing us at <a href="mailto:${contactEmail}">${contactEmail}</a>.
    <br><br>
    <a href="${appUrl}/api/privacy">View Privacy Policy</a>
  </p>

  <script>
    document.getElementById('deletion-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const reason = document.getElementById('reason').value;
      const errorBox = document.getElementById('error-message');
      const successBox = document.getElementById('success-message');
      const form = document.getElementById('deletion-form');

      errorBox.style.display = 'none';

      try {
        const response = await fetch('${appUrl}/api/data-deletion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, reason }),
        });

        const data = await response.json();

        if (response.ok) {
          form.style.display = 'none';
          successBox.style.display = 'block';
        } else {
          errorBox.textContent = data.error || 'An error occurred. Please try again.';
          errorBox.style.display = 'block';
        }
      } catch (error) {
        errorBox.textContent = 'An error occurred. Please try again or contact support.';
        errorBox.style.display = 'block';
      }
    });
  </script>
</body>
</html>
    `);
  }

  // Handle POST request - process the deletion request
  if (req.method === 'POST') {
    const { email, reason } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email address is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    try {
      if (hasDatabase) {
        // Check if user exists
        const userResult = await sql`SELECT id FROM users WHERE email = ${email}`;

        if (userResult.rows.length === 0) {
          // Even if user doesn't exist, return success to prevent email enumeration
          console.log(`[Data Deletion] Request for non-existent email: ${email}`);
          return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, it will be deleted within 30 days.'
          });
        }

        const userId = userResult.rows[0].id;

        // Log the deletion request (you could also store this in a separate table)
        console.log(`[Data Deletion] Request received for user ${userId} (${email}). Reason: ${reason || 'Not provided'}`);

        // Delete user data in order (respecting foreign key constraints)
        // 1. Delete comments on user's posts
        await sql`
          DELETE FROM comments
          WHERE post_id IN (SELECT id FROM posts WHERE user_id = ${userId})
        `;

        // 2. Delete posts
        await sql`DELETE FROM posts WHERE user_id = ${userId}`;

        // 3. Delete social accounts
        await sql`DELETE FROM social_accounts WHERE user_id = ${userId}`;

        // 4. Delete user
        await sql`DELETE FROM users WHERE id = ${userId}`;

        console.log(`[Data Deletion] Successfully deleted all data for user ${userId}`);
      } else {
        // Demo mode - just log the request
        console.log(`[Mock Mode] Would delete data for email: ${email}. Reason: ${reason || 'Not provided'}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Your data has been deleted successfully.'
      });
    } catch (error) {
      console.error('[Data Deletion] Error:', error);
      return res.status(500).json({
        error: 'An error occurred while processing your request. Please try again later or contact support.'
      });
    }
  }

  // Method not allowed for other HTTP methods
  return res.status(405).json({ error: 'Method not allowed' });
}
