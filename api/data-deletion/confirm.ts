import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Data Deletion Confirmation Page
 *
 * This endpoint displays a confirmation page after data has been deleted.
 * It's referenced by the callback endpoint and can be used by LinkedIn
 * to verify that data deletion was completed.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appName = process.env.APP_NAME || 'TMJ Social Media Manager';
  const { code } = req.query;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Deletion Confirmed - ${appName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
      background: #f9fafb;
      text-align: center;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .check-icon {
      width: 80px;
      height: 80px;
      background: #d1fae5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .check-icon svg {
      width: 40px;
      height: 40px;
      color: #059669;
    }
    h1 {
      color: #059669;
      margin-bottom: 10px;
    }
    p {
      color: #6b7280;
    }
    .code {
      background: #f3f4f6;
      padding: 10px 20px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      color: #4b5563;
      margin: 20px 0;
      display: inline-block;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="check-icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <h1>Data Deletion Confirmed</h1>
    <p>Your data has been successfully deleted from ${appName}.</p>
    ${code ? `<div class="code">Confirmation: ${code}</div>` : ''}
    <p style="font-size: 0.9em; margin-top: 30px;">
      If you have any questions, please contact our support team.
    </p>
  </div>
</body>
</html>
  `);
}
