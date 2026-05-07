/**
 * Plain-string email templates.
 *
 * Kept dead simple on purpose: no MJML, no React Email. We can swap to React
 * Email later if marketing wants richer templates — for MVP, the goal is to
 * get verification and reset flows working.
 *
 * Each template returns { subject, html, text }. Resend supports both.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

interface VerifyEmailVars {
  name: string;
  verifyUrl: string;
}

export function verifyEmailTemplate(vars: VerifyEmailVars): RenderedEmail {
  return {
    subject: "Verify your Holicruit email",
    text: [
      `Hi ${vars.name},`,
      ``,
      `Welcome to Holicruit. Please confirm your email by visiting:`,
      vars.verifyUrl,
      ``,
      `This link expires in 24 hours.`,
      ``,
      `If you didn't sign up for Holicruit, you can ignore this email.`,
    ].join("\n"),
    html: baseHtml(
      "Verify your email",
      `<p>Hi ${escapeHtml(vars.name)},</p>
       <p>Welcome to Holicruit. Please confirm your email to finish setting up your account.</p>
       <p>${button(vars.verifyUrl, "Verify my email")}</p>
       <p style="color:#6b7280;font-size:14px">Or paste this link into your browser:<br/>
       <a href="${vars.verifyUrl}">${escapeHtml(vars.verifyUrl)}</a></p>
       <p style="color:#6b7280;font-size:14px">This link expires in 24 hours. If you didn't sign up for Holicruit, you can ignore this email.</p>`,
    ),
  };
}

interface ResetPasswordVars {
  name: string;
  resetUrl: string;
}

export function resetPasswordTemplate(vars: ResetPasswordVars): RenderedEmail {
  return {
    subject: "Reset your Holicruit password",
    text: [
      `Hi ${vars.name},`,
      ``,
      `Someone (hopefully you) requested a password reset for your Holicruit account.`,
      `Reset it here:`,
      vars.resetUrl,
      ``,
      `This link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    ].join("\n"),
    html: baseHtml(
      "Reset your password",
      `<p>Hi ${escapeHtml(vars.name)},</p>
       <p>Someone (hopefully you) requested a password reset for your Holicruit account.</p>
       <p>${button(vars.resetUrl, "Reset my password")}</p>
       <p style="color:#6b7280;font-size:14px">Or paste this link:<br/>
       <a href="${vars.resetUrl}">${escapeHtml(vars.resetUrl)}</a></p>
       <p style="color:#6b7280;font-size:14px">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    ),
  };
}

// ── helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">${escapeHtml(label)}</a>`;
}

function baseHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;max-width:560px;margin:0 auto;padding:24px">
    <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />
    <p style="color:#9ca3af;font-size:12px">Holicruit · Connecting Hiring Managers, Headhunters &amp; Candidates</p>
  </body>
</html>`;
}
