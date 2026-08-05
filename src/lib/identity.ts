/**
 * Identity resolution — the one place that decides whether a counterparty sees
 * a real name or an alias. Radical transparency about *fit and evidence* does
 * not require exposing *who you are*: people can operate under an alias and
 * reveal themselves only when they explicitly choose, per match.
 *
 * All helpers are backward-compatible: with no alias / anonymity set, they
 * return the real values unchanged, so existing views behave exactly as before.
 */

export function initialsFrom(name: string): string {
  const w = name.trim().split(/\s+/).filter(Boolean);
  const first = w[0]?.[0] ?? "";
  const last = w.length > 1 ? w[w.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "?";
}

export type Identity = { name: string; initials: string; masked: boolean };

/** How a person (candidate or recruiter) appears to the other side. */
export function personIdentity(
  u: { name: string; initials: string; alias?: string | null; anonymous?: boolean | null },
  revealed: boolean,
): Identity {
  const hide = Boolean(u.anonymous) && !revealed;
  if (!hide) return { name: u.name, initials: u.initials, masked: false };
  const alias = u.alias?.trim() || "Anonymous";
  return { name: alias, initials: initialsFrom(alias), masked: true };
}

export type EmployerIdentity = {
  companyName: string;
  companyMasked: boolean;
  hmName: string;
  hmInitials: string;
  hmHeadline: string;
  hmMasked: boolean;
};

/**
 * How the employer side (company + hiring manager) appears to a candidate.
 * Two independent, per-role switches: hide the company (confidential role) and
 * hide the hiring manager's name. A confidential company also hides its HM.
 */
export function employerIdentity(
  o: {
    companyName: string;
    companyConfidential?: boolean | null;
    companyAlias?: string | null;
    hmName: string;
    hmInitials: string;
    hmHeadline: string;
    hmAnonymous?: boolean | null;
    hmAlias?: string | null;
  },
  revealed: boolean,
): EmployerIdentity {
  const hideCompany = Boolean(o.companyConfidential) && !revealed;
  const hideHm = (Boolean(o.companyConfidential) || Boolean(o.hmAnonymous)) && !revealed;

  const companyName = hideCompany ? o.companyAlias?.trim() || "Confidential company" : o.companyName;
  const hmName = hideHm ? o.hmAlias?.trim() || "Hiring team" : o.hmName;
  const hmInitials = hideHm ? initialsFrom(hmName) : o.hmInitials;
  const hmHeadline = hideHm
    ? hideCompany
      ? "Hiring manager"
      : `Hiring manager · ${companyName}`
    : o.hmHeadline;

  return {
    companyName,
    companyMasked: hideCompany,
    hmName,
    hmInitials,
    hmHeadline,
    hmMasked: hideHm,
  };
}
