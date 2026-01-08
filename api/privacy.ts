import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appName = process.env.APP_NAME || 'TMJ Social Media Manager';
  const contactEmail = process.env.CONTACT_EMAIL || 'support@themarketingjunctiontmj.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://planable-tmj.vercel.app';

  // Return HTML privacy policy page
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - ${appName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
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
    h2 {
      color: #1f2937;
      margin-top: 30px;
    }
    a {
      color: #3b82f6;
    }
    .last-updated {
      color: #6b7280;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    .contact-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="last-updated">Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

  <h2>1. Introduction</h2>
  <p>${appName} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media management application.</p>

  <h2>2. Information We Collect</h2>
  <p>We collect information that you provide directly to us, including:</p>
  <ul>
    <li><strong>Account Information:</strong> Email address and name when you create an account</li>
    <li><strong>Social Media Credentials:</strong> OAuth tokens from connected social platforms (Twitter/X, LinkedIn, Facebook, Instagram)</li>
    <li><strong>Content:</strong> Posts, images, and scheduling information you create within the application</li>
    <li><strong>Usage Data:</strong> Information about how you interact with our application</li>
  </ul>

  <h2>3. How We Use Your Information</h2>
  <p>We use the information we collect to:</p>
  <ul>
    <li>Provide, maintain, and improve our services</li>
    <li>Publish content to your connected social media accounts on your behalf</li>
    <li>Schedule and manage your social media posts</li>
    <li>Send you technical notices and support messages</li>
    <li>Respond to your comments and questions</li>
  </ul>

  <h2>4. Data Sharing and Disclosure</h2>
  <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following situations:</p>
  <ul>
    <li><strong>With Social Platforms:</strong> To publish content on your behalf through their APIs</li>
    <li><strong>Service Providers:</strong> With vendors who help us operate our services (hosting, analytics)</li>
    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
  </ul>

  <h2>5. Data Retention</h2>
  <p>We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time.</p>

  <h2>6. Data Security</h2>
  <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
  <ul>
    <li>Encryption of data in transit (HTTPS/TLS)</li>
    <li>Secure storage of OAuth tokens</li>
    <li>Regular security assessments</li>
    <li>Access controls and authentication</li>
  </ul>

  <h2>7. Your Rights</h2>
  <p>You have the right to:</p>
  <ul>
    <li><strong>Access:</strong> Request a copy of your personal data</li>
    <li><strong>Correction:</strong> Request correction of inaccurate data</li>
    <li><strong>Deletion:</strong> Request deletion of your data</li>
    <li><strong>Disconnect:</strong> Revoke access to connected social media accounts at any time</li>
  </ul>

  <h2>8. Data Deletion</h2>
  <p>To request deletion of your data:</p>
  <ul>
    <li>Visit our <a href="${appUrl}/api/data-deletion">Data Deletion Request</a> page</li>
    <li>Email us at <a href="mailto:${contactEmail}">${contactEmail}</a></li>
  </ul>
  <p>We will process your request within 30 days.</p>

  <h2>9. Third-Party Platforms</h2>
  <p>Our application integrates with the following social media platforms:</p>
  <ul>
    <li><strong>LinkedIn:</strong> Subject to <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank">LinkedIn's Privacy Policy</a></li>
    <li><strong>Twitter/X:</strong> Subject to <a href="https://twitter.com/en/privacy" target="_blank">X's Privacy Policy</a></li>
    <li><strong>Facebook:</strong> Subject to <a href="https://www.facebook.com/privacy/policy" target="_blank">Meta's Privacy Policy</a></li>
    <li><strong>Instagram:</strong> Subject to <a href="https://help.instagram.com/519522125107875" target="_blank">Instagram's Privacy Policy</a></li>
  </ul>

  <h2>10. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

  <div class="contact-box">
    <h2 style="margin-top: 0;">11. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
    <p>
      <strong>Email:</strong> <a href="mailto:${contactEmail}">${contactEmail}</a><br>
      <strong>Website:</strong> <a href="${appUrl}">${appUrl}</a>
    </p>
  </div>
</body>
</html>
  `);
}
