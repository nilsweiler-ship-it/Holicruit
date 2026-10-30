/**
 * Minimal in-memory sliding-window rate limiter (no dependencies, no I/O).
 *
 * Scope and limits: state lives in this server process only. That is enough
 * for a single Railway instance; with several instances or serverless, each
 * instance counts separately and a shared store (Postgres/Redis) is needed.
 */

export interface RateLimitRule {
  /** Maximum number of recorded hits allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitStatus {
  /** False once `limit` hits are recorded inside the window. */
  allowed: boolean;
  /** Hits still allowed before the key is blocked. */
  remaining: number;
  /** Milliseconds until the oldest hit leaves the window (0 when allowed). */
  retryAfterMs: number;
}

export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    readonly rule: RateLimitRule,
    private readonly now: () => number = Date.now,
    /** Upper bound on tracked keys, so a key-spraying attacker can't grow memory forever. */
    private readonly maxKeys = 50_000,
  ) {}

  private live(key: string, t: number): number[] {
    const list = this.hits.get(key);
    if (!list) return [];
    const cutoff = t - this.rule.windowMs;
    const kept = list.filter((ts) => ts > cutoff);
    if (kept.length) this.hits.set(key, kept);
    else this.hits.delete(key);
    return kept;
  }

  /** Status for `key` without recording anything. */
  check(key: string): RateLimitStatus {
    const t = this.now();
    const list = this.live(key, t);
    const allowed = list.length < this.rule.limit;
    return {
      allowed,
      remaining: Math.max(0, this.rule.limit - list.length),
      retryAfterMs: allowed ? 0 : Math.max(0, list[0]! + this.rule.windowMs - t),
    };
  }

  /** Record one hit (e.g. a failed login) for `key`. */
  hit(key: string): RateLimitStatus {
    const t = this.now();
    const list = this.live(key, t);
    list.push(t);
    this.hits.set(key, list);
    if (this.hits.size > this.maxKeys) this.prune(t);
    return this.check(key);
  }

  /** Forget `key` (e.g. after a successful login). */
  reset(key: string): void {
    this.hits.delete(key);
  }

  /** Drop expired keys; if still over capacity, evict the oldest-inserted keys. */
  prune(t: number = this.now()): void {
    for (const key of [...this.hits.keys()]) this.live(key, t);
    const excess = this.hits.size - this.maxKeys;
    if (excess > 0) {
      let i = 0;
      for (const key of this.hits.keys()) {
        if (i++ >= excess) break;
        this.hits.delete(key);
      }
    }
  }

  /** Number of keys currently tracked (for tests/diagnostics). */
  get size(): number {
    return this.hits.size;
  }
}

/** Minimal header reader — satisfied by `Headers` and Next's `headers()` result. */
export interface HeaderSource {
  get(name: string): string | null;
}

/**
 * Best-effort client IP. Prefers `x-real-ip` (set by the platform proxy), else
 * the RIGHT-most `x-forwarded-for` entry — the one appended by our own proxy;
 * left-most entries are client-supplied and trivially spoofed.
 */
export function clientIp(h: HeaderSource): string {
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return "unknown";
}

export const TOO_MANY_ATTEMPTS = "Too many attempts, try again later.";

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/** App-wide limiter instances, kept on globalThis so dev hot-reloads don't reset them. */
type Limiters = {
  loginFailuresByEmail: RateLimiter;
  loginFailuresByIp: RateLimiter;
  registrationsByIp: RateLimiter;
};
const g = globalThis as unknown as { __holicruitLimiters?: Limiters };

export const limiters: Limiters = (g.__holicruitLimiters ??= {
  // 5 failed logins per account per 15 min.
  loginFailuresByEmail: new RateLimiter({ limit: 5, windowMs: FIFTEEN_MIN }),
  // 20 failed logins per IP per 15 min (offices/NAT share an IP; the per-account cap is the main guard).
  loginFailuresByIp: new RateLimiter({ limit: 20, windowMs: FIFTEEN_MIN }),
  // 20 registration attempts per IP per hour (caps "email already exists" probing;
  // leaves headroom for the CI browser suites, which all register from one IP).
  registrationsByIp: new RateLimiter({ limit: 20, windowMs: ONE_HOUR }),
});
