const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://framecast.ai";

/**
 * Shared email layout wrapper.
 * Brand colors: primary #0025cc, accent #2b5fff
 * Font: Plus Jakarta Sans with system fallbacks
 */
export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Framecast AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; width: 100% !important; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <!-- Top accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#0025cc,#2b5fff);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Content -->
          ${content}
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;line-height:1.5;">
                You&rsquo;re receiving this email because you have an account on Framecast AI.
              </p>
              <p style="margin:0;font-size:11px;color:#d1d5db;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Framecast AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Email sent when an AI model has finished training.
 */
export function modelTrainedEmail(): string {
  return emailLayout(`
          <tr>
            <td style="padding:36px 40px 0;text-align:center;">
              <!-- Checkmark icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:56px;height:56px;border-radius:50%;background-color:#f0f4ff;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;line-height:56px;">&#10003;</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Your AI Model is Ready
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 0;text-align:center;">
              <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Great news! Your custom AI model has been successfully trained and is now ready to generate stunning headshots.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <a href="${appUrl}/dashboard" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 32px;background-color:#0025cc;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Go to Dashboard
              </a>
            </td>
          </tr>`);
}

/**
 * Email sent when headshots have been generated and are ready for download.
 */
export function headshotsReadyEmail(): string {
  return emailLayout(`
          <tr>
            <td style="padding:36px 40px 0;text-align:center;">
              <!-- Camera icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:56px;height:56px;border-radius:50%;background-color:#f0f4ff;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;line-height:56px;">&#128247;</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Your Headshots Are Ready
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 0;text-align:center;">
              <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Your AI-generated headshots are now ready for download. Head to your dashboard to view and download your professional photos.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <a href="${appUrl}/dashboard" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 32px;background-color:#0025cc;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Go to Dashboard
              </a>
            </td>
          </tr>`);
}

/**
 * Email sent to confirm a user's email address during signup.
 */
export function confirmEmailTemplate(confirmUrl: string): string {
  return emailLayout(`
          <tr>
            <td style="padding:36px 40px 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:56px;height:56px;border-radius:50%;background-color:#f0f4ff;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;line-height:56px;">&#9993;</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Confirm Your Email
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 0;text-align:center;">
              <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Thanks for signing up for Framecast AI! Please confirm your email address by clicking the button below.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 8px;text-align:center;">
              <a href="${confirmUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 32px;background-color:#0025cc;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Confirm Email Address
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                If the button doesn&rsquo;t work, copy and paste this link into your browser:<br/>
                <a href="${confirmUrl}" style="color:#2b5fff;word-break:break-all;font-size:11px;">${confirmUrl}</a>
              </p>
            </td>
          </tr>`);
}

/**
 * Email sent when a user requests a password reset.
 */
export function resetPasswordEmailTemplate(resetUrl: string): string {
  return emailLayout(`
          <tr>
            <td style="padding:36px 40px 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:56px;height:56px;border-radius:50%;background-color:#f0f4ff;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;line-height:56px;">&#128274;</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Reset Your Password
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 0;text-align:center;">
              <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                We received a request to reset your Framecast AI password. Click the button below to set a new one. If you didn&rsquo;t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 8px;text-align:center;">
              <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 32px;background-color:#0025cc;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Reset Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                If the button doesn&rsquo;t work, copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color:#2b5fff;word-break:break-all;font-size:11px;">${resetUrl}</a>
              </p>
            </td>
          </tr>`);
}

/**
 * Welcome email sent after a user successfully confirms their email or signs up via OAuth.
 */
export function welcomeEmail(): string {
  return emailLayout(`
          <tr>
            <td style="padding:36px 40px 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:56px;height:56px;border-radius:50%;background-color:#f0f4ff;text-align:center;vertical-align:middle;">
                    <span style="font-size:28px;line-height:56px;">&#127881;</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Welcome to Framecast AI!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 0;text-align:center;">
              <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                You&rsquo;re all set! Your account is ready. Start creating stunning AI-powered professional headshots in minutes.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background-color:#f9fafb;border-radius:10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#374151;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                          <strong style="color:#0025cc;">1.</strong> Upload your photos
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#374151;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                          <strong style="color:#0025cc;">2.</strong> Train your personal AI model
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#374151;line-height:1.6;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                          <strong style="color:#0025cc;">3.</strong> Get professional headshots in minutes
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <a href="${appUrl}/dashboard" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 32px;background-color:#0025cc;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
                Get Started
              </a>
            </td>
          </tr>`);
}
