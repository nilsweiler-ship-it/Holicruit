/**
 * Outbound-fetch safety (SSRF guard) for user-supplied URLs.
 *
 * Rules: http/https only, default port or 80/443, no credentials in the URL,
 * no internal-looking hostnames, and EVERY address the name resolves to must be
 * public unicast. Redirects are followed manually (max 3) and each hop is
 * re-validated. The real transport re-checks the address at connect time via a
 * guarded `lookup`, so a DNS answer that changes between check and connect
 * (rebinding) is still refused.
 *
 * Pure apart from the default resolver/transport, both of which are injectable
 * so the policy can be unit-tested without network or DNS.
 */
import { isIP } from "node:net";

export type ResolvedAddress = { address: string; family: number };
export type Resolver = (hostname: string) => Promise<ResolvedAddress[]>;

export type UrlCheck =
  | { ok: true; url: URL; addresses: string[] }
  | { ok: false; reason: UrlRejectReason };

export type UrlRejectReason =
  | "invalid"
  | "scheme"
  | "credentials"
  | "port"
  | "hostname"
  | "address"
  | "dns";

// ── IP classification ───────────────────────────────────────────────────────

function parseIPv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    out.push(n);
  }
  return out;
}

/** Blocked IPv4: anything that isn't ordinary public unicast. */
function isBlockedIPv4(o: number[]): boolean {
  const [a, b, c] = o as [number, number, number, number];
  if (a === 0) return true; // "this network"
  if (a === 10) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 0 && c === 0) return true; // IETF protocol assignments
  if (a === 192 && b === 0 && c === 2) return true; // TEST-NET-1
  if (a === 192 && b === 88 && c === 99) return true; // 6to4 relay anycast
  if (a === 192 && b === 168) return true; // private
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a === 198 && b === 51 && c === 100) return true; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true; // TEST-NET-3
  if (a >= 224) return true; // multicast 224/4, reserved 240/4, broadcast
  return false;
}

/** Parse an IPv6 literal into 8 16-bit groups (supports `::` and a dotted IPv4 tail). */
function parseIPv6(ip: string): number[] | null {
  let s = ip.toLowerCase();
  const zone = s.indexOf("%");
  if (zone !== -1) s = s.slice(0, zone);
  let tail: number[] = [];
  const lastColon = s.lastIndexOf(":");
  if (s.slice(lastColon + 1).includes(".")) {
    const v4 = parseIPv4(s.slice(lastColon + 1));
    if (!v4) return null;
    tail = [(v4[0]! << 8) | v4[1]!, (v4[2]! << 8) | v4[3]!];
    s = s.slice(0, lastColon + 1) + "0:0"; // placeholder groups, replaced below
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const toGroups = (h: string) => (h === "" ? [] : h.split(":"));
  const head = toGroups(halves[0]!);
  const rest = halves.length === 2 ? toGroups(halves[1]!) : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 && missing !== 0) return null;
  if (halves.length === 2 && missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...rest];
  if (groups.length !== 8) return null;
  const out: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    out.push(parseInt(g, 16));
  }
  if (tail.length) {
    out[6] = tail[0]!;
    out[7] = tail[1]!;
  }
  return out;
}

function embeddedV4(g: number[], hi: number, lo: number): number[] {
  return [g[hi]! >> 8, g[hi]! & 0xff, g[lo]! >> 8, g[lo]! & 0xff];
}

function isBlockedIPv6(g: number[]): boolean {
  const allZeroUpTo = (n: number) => g.slice(0, n).every((x) => x === 0);
  if (allZeroUpTo(8)) return true; // :: unspecified
  if (allZeroUpTo(7) && g[7] === 1) return true; // ::1 loopback
  if (allZeroUpTo(5) && g[5] === 0xffff) return true; // ::ffff:0:0/96 IPv4-mapped
  if (allZeroUpTo(4) && g[4] === 0xffff && g[5] === 0) return true; // ::ffff:0:0:0/96 IPv4-translated
  if (allZeroUpTo(6)) return true; // ::/96 IPv4-compatible (deprecated)
  if (g[0] === 0x64 && g[1] === 0xff9b) {
    // NAT64 64:ff9b::/96 (and the local-use 64:ff9b:1::/48): judge the embedded IPv4.
    return g.slice(2, 6).some((x) => x !== 0) || isBlockedIPv4(embeddedV4(g, 6, 7));
  }
  if (g[0] === 0x2002) return isBlockedIPv4(embeddedV4(g, 1, 2)); // 6to4
  if (g[0] === 0x2001 && g[1] === 0) return true; // Teredo 2001::/32
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation
  if (g[0] === 0x0100 && g[1] === 0 && g[2] === 0 && g[3] === 0) return true; // discard-only 100::/64
  const top = g[0]!;
  if ((top & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local (ULA)
  if ((top & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((top & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local (deprecated)
  if ((top & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  return false;
}

/** True when `ip` must never be contacted. Unparseable input is blocked. */
export function isBlockedIp(ip: string): boolean {
  const raw = ip.replace(/^\[|\]$/g, "");
  const kind = isIP(raw.split("%")[0] ?? "");
  if (kind === 4) {
    const o = parseIPv4(raw);
    return !o || isBlockedIPv4(o);
  }
  if (kind === 6) {
    const g = parseIPv6(raw);
    return !g || isBlockedIPv6(g);
  }
  return true;
}

// ── Hostname + URL policy ───────────────────────────────────────────────────

const BLOCKED_SUFFIXES = [".internal", ".local", ".localhost", ".localdomain", ".home.arpa", ".lan", ".intranet", ".corp"];

/** Hostnames that point (or may point) inside our network. */
export function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.+$/, "");
  if (!h) return true;
  if (h === "localhost" || h === "internal" || h === "local") return true;
  if (BLOCKED_SUFFIXES.some((s) => h.endsWith(s))) return true;
  // Single-label names resolve through search domains (e.g. "postgres").
  if (!h.includes(".") && isIP(h) === 0) return true;
  return false;
}

/** Parse + static checks (no DNS). Returns the URL or why it was refused. */
export function parsePublicUrl(raw: string | URL): { ok: true; url: URL } | { ok: false; reason: UrlRejectReason } {
  let url: URL;
  try {
    url = new URL(String(raw));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, reason: "scheme" };
  if (url.username || url.password) return { ok: false, reason: "credentials" };
  if (url.port && url.port !== "80" && url.port !== "443") return { ok: false, reason: "port" };
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (isBlockedIp(host)) return { ok: false, reason: "address" };
  } else if (isBlockedHostname(host)) {
    return { ok: false, reason: "hostname" };
  }
  return { ok: true, url };
}

/** Default resolver: all A/AAAA records, unordered. */
export const systemResolver: Resolver = async (hostname) => {
  const { lookup } = await import("node:dns/promises");
  return lookup(hostname, { all: true, verbatim: true });
};

/**
 * Full check: static policy + DNS. Every resolved address must be public —
 * one private record in the set is enough to refuse.
 */
export async function checkPublicUrl(raw: string | URL, resolve: Resolver = systemResolver): Promise<UrlCheck> {
  const parsed = parsePublicUrl(raw);
  if (!parsed.ok) return parsed;
  const url = parsed.url;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return { ok: true, url, addresses: [host] };
  let addrs: ResolvedAddress[];
  try {
    addrs = await resolve(host);
  } catch {
    return { ok: false, reason: "dns" };
  }
  if (!addrs.length) return { ok: false, reason: "dns" };
  if (addrs.some((a) => isBlockedIp(a.address))) return { ok: false, reason: "address" };
  return { ok: true, url, addresses: addrs.map((a) => a.address) };
}

// ── Fetching ────────────────────────────────────────────────────────────────

export type TransportResponse = {
  status: number;
  headers: Record<string, string | undefined>;
  body: string;
};

export type Transport = (
  url: URL,
  opts: { headers: Record<string, string>; timeoutMs: number; maxBytes: number; resolve: Resolver },
) => Promise<TransportResponse>;

export class UnsafeUrlError extends Error {
  constructor(public reason: UrlRejectReason | "redirects" | "too_large" | "timeout") {
    super(`Refused to fetch URL (${reason})`);
    this.name = "UnsafeUrlError";
  }
}

/**
 * Default transport: node:http(s) with a `lookup` hook that re-validates the
 * address actually being connected to. No automatic redirects, no proxies.
 */
export const nodeTransport: Transport = async (url, { headers, timeoutMs, maxBytes, resolve }) => {
  const mod = url.protocol === "https:" ? await import("node:https") : await import("node:http");
  const zlib = await import("node:zlib");

  type LookupCb = (err: NodeJS.ErrnoException | null, address: string | ResolvedAddress[], family?: number) => void;
  const guardedLookup = (hostname: string, options: { all?: boolean } | number | undefined, cb: LookupCb) => {
    resolve(hostname)
      .then((addrs) => {
        const bad = !addrs.length || addrs.some((a) => isBlockedIp(a.address));
        if (bad) {
          const e = new Error("blocked address") as NodeJS.ErrnoException;
          e.code = "EBLOCKED";
          cb(e, "", 0);
          return;
        }
        if (typeof options === "object" && options?.all) cb(null, addrs);
        else cb(null, addrs[0]!.address, addrs[0]!.family);
      })
      .catch((err: NodeJS.ErrnoException) => cb(err, "", 0));
  };

  return new Promise<TransportResponse>((resolveP, reject) => {
    const req = mod.request(
      url,
      {
        method: "GET",
        headers: { ...headers, "Accept-Encoding": "gzip, deflate, br" },
        lookup: guardedLookup as never,
        agent: false,
      },
      (res) => {
        const enc = String(res.headers["content-encoding"] ?? "").toLowerCase();
        const stream =
          enc === "gzip"
            ? res.pipe(zlib.createGunzip())
            : enc === "deflate"
              ? res.pipe(zlib.createInflate())
              : enc === "br"
                ? res.pipe(zlib.createBrotliDecompress())
                : res;
        const chunks: Buffer[] = [];
        let size = 0;
        stream.on("data", (c: Buffer) => {
          size += c.length;
          if (size > maxBytes) {
            req.destroy(new UnsafeUrlError("too_large"));
            return;
          }
          chunks.push(c);
        });
        stream.on("end", () => {
          clearTimeout(timer);
          const h: Record<string, string | undefined> = {};
          for (const [k, v] of Object.entries(res.headers)) h[k] = Array.isArray(v) ? v.join(", ") : v;
          resolveP({ status: res.statusCode ?? 0, headers: h, body: Buffer.concat(chunks).toString("utf8") });
        });
        stream.on("error", (e: Error) => {
          clearTimeout(timer);
          reject(e);
        });
      },
    );
    const timer = setTimeout(() => req.destroy(new UnsafeUrlError("timeout")), timeoutMs);
    req.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    req.end();
  });
};

export type SafeFetchResult = { ok: boolean; status: number; url: URL; text: string };

/**
 * GET a user-supplied URL safely: validate, fetch without auto-redirects, and
 * re-validate every redirect hop (max `maxRedirects`). Throws UnsafeUrlError
 * when any hop is refused.
 */
export async function safeFetch(
  raw: string | URL,
  opts: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    maxBytes?: number;
    maxRedirects?: number;
    resolve?: Resolver;
    transport?: Transport;
  } = {},
): Promise<SafeFetchResult> {
  const resolve = opts.resolve ?? systemResolver;
  const transport = opts.transport ?? nodeTransport;
  const maxRedirects = opts.maxRedirects ?? 3;
  let current: string | URL = raw;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const check = await checkPublicUrl(current, resolve);
    if (!check.ok) throw new UnsafeUrlError(check.reason);
    const res = await transport(check.url, {
      headers: opts.headers ?? {},
      timeoutMs: opts.timeoutMs ?? 9000,
      maxBytes: opts.maxBytes ?? 2 * 1024 * 1024,
      resolve,
    });
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      current = new URL(res.headers.location, check.url);
      continue;
    }
    return { ok: res.status >= 200 && res.status < 300, status: res.status, url: check.url, text: res.body };
  }
  throw new UnsafeUrlError("redirects");
}
