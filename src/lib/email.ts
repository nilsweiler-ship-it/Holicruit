import nodemailer from "nodemailer";

const SMTP_CONFIGURED =
  !!process.env.SMTP_HOST && !!process.env.SMTP_USER;

const transporter = SMTP_CONFIGURED
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    })
  : null;

const FROM = process.env.EMAIL_FROM || "Holicruit <noreply@holicruit.com>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log(`[Email stub] To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({ from: FROM, to, subject, html });
}

// ─── Notification templates ───

export async function sendApplicationReceived(
  hmEmail: string,
  candidateName: string,
  roleTitle: string,
  matchScore: number,
  roleId: string
) {
  await send(
    hmEmail,
    `New application for ${roleTitle}`,
    `<h2>New Application Received</h2>
     <p><strong>${candidateName}</strong> applied for <strong>${roleTitle}</strong>.</p>
     <p>Match score: <strong>${matchScore}%</strong></p>
     <p><a href="${APP_URL}/dashboard/hiring-manager/roles/${roleId}">View pipeline</a></p>`
  );
}

export async function sendShortlisted(
  candidateEmail: string,
  roleTitle: string,
  companyName: string
) {
  await send(
    candidateEmail,
    `You've been shortlisted for ${roleTitle}`,
    `<h2>Great news!</h2>
     <p>You've been shortlisted for <strong>${roleTitle}</strong> at <strong>${companyName}</strong>.</p>
     <p><a href="${APP_URL}/dashboard/candidate/matches">View your applications</a></p>`
  );
}

export async function sendStageUpdate(
  candidateEmail: string,
  roleTitle: string,
  newStage: string
) {
  await send(
    candidateEmail,
    `Application update: ${roleTitle}`,
    `<h2>Application Status Update</h2>
     <p>Your application for <strong>${roleTitle}</strong> has moved to: <strong>${newStage}</strong>.</p>
     <p><a href="${APP_URL}/dashboard/candidate/matches">View details</a></p>`
  );
}

export async function sendOfferExtended(
  candidateEmail: string,
  roleTitle: string,
  companyName: string
) {
  await send(
    candidateEmail,
    `Offer from ${companyName}`,
    `<h2>Congratulations!</h2>
     <p><strong>${companyName}</strong> has extended an offer for <strong>${roleTitle}</strong>.</p>
     <p><a href="${APP_URL}/dashboard/candidate/matches">View your applications</a></p>`
  );
}

export async function sendHeadhunterSubmissionUpdate(
  hhEmail: string,
  candidateName: string,
  roleTitle: string,
  newStage: string
) {
  await send(
    hhEmail,
    `Submission update: ${candidateName} for ${roleTitle}`,
    `<h2>Submission Update</h2>
     <p>Your submitted candidate <strong>${candidateName}</strong> for <strong>${roleTitle}</strong> has moved to: <strong>${newStage}</strong>.</p>
     <p><a href="${APP_URL}/dashboard/headhunter/submissions">View submissions</a></p>`
  );
}
