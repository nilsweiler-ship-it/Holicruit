/**
 * Password policy — shared by the browser (live checklist) and the server
 * (the actual enforcement). Pure module: no Node or DOM imports.
 *
 * Applies whenever a password is SET (registration, claiming an imported
 * profile). Existing accounts keep working with their current password.
 */

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

export type PasswordRule = { id: string; label: string; test: (pw: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: `At least ${PASSWORD_MIN} characters`, test: (pw) => pw.length >= PASSWORD_MIN },
  { id: "lower", label: "A lowercase letter", test: (pw) => /\p{Ll}/u.test(pw) },
  { id: "upper", label: "An uppercase letter", test: (pw) => /\p{Lu}/u.test(pw) },
  { id: "digit", label: "A number", test: (pw) => /\p{Nd}/u.test(pw) },
  { id: "symbol", label: "A symbol (e.g. ! ? # -)", test: (pw) => /[^\p{L}\p{Nd}\s]/u.test(pw) },
];

// A few passwords that technically pass the rules but are guessed first.
const COMMON = new Set(
  [
    "password1!", "password123!", "passw0rd!", "p@ssw0rd123", "p@ssword123", "welcome123!",
    "qwerty123!", "letmein123!", "admin12345!", "holicruit1!", "holicruit123!", "changeme123!",
  ].map((s) => s.toLowerCase()),
);

export type PasswordCheck = { ok: boolean; failed: PasswordRule[]; message: string | null };

/** Server + client check. `email` (optional) rejects passwords containing the address's name part. */
export function checkPassword(pw: string, opts: { email?: string | null } = {}): PasswordCheck {
  const s = typeof pw === "string" ? pw : "";
  if (s.length > PASSWORD_MAX) {
    return { ok: false, failed: [], message: `Password must be at most ${PASSWORD_MAX} characters.` };
  }
  const failed = PASSWORD_RULES.filter((r) => !r.test(s));
  if (failed.length) {
    return {
      ok: false,
      failed,
      message: `Password needs: ${failed.map((r) => r.label.toLowerCase()).join(", ")}.`,
    };
  }
  if (COMMON.has(s.toLowerCase())) {
    return { ok: false, failed: [], message: "That password is too common — please choose another." };
  }
  const local = (opts.email ?? "").split("@")[0]?.toLowerCase() ?? "";
  if (local.length >= 4 && s.toLowerCase().includes(local)) {
    return { ok: false, failed: [], message: "Password must not contain your email address." };
  }
  return { ok: true, failed: [], message: null };
}

export function passwordsMatch(pw: unknown, confirm: unknown): boolean {
  return typeof pw === "string" && typeof confirm === "string" && pw.length > 0 && pw === confirm;
}
