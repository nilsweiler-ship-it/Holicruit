import { test } from "node:test";
import assert from "node:assert/strict";
import { RateLimiter, clientIp } from "../../src/lib/ratelimit";
import { isDemoEmail, sameWorld } from "../../src/lib/demo";

function clock(start = 1_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

test("RateLimiter: allows up to the limit, then blocks", () => {
  const c = clock();
  const rl = new RateLimiter({ limit: 5, windowMs: 15 * 60_000 }, c.now);
  for (let i = 0; i < 5; i++) {
    assert.equal(rl.check("a").allowed, true, `attempt ${i + 1} allowed`);
    rl.hit("a");
  }
  const s = rl.check("a");
  assert.equal(s.allowed, false);
  assert.equal(s.remaining, 0);
  assert.ok(s.retryAfterMs > 0 && s.retryAfterMs <= 15 * 60_000);
});

test("RateLimiter: keys are independent", () => {
  const c = clock();
  const rl = new RateLimiter({ limit: 2, windowMs: 1000 }, c.now);
  rl.hit("a");
  rl.hit("a");
  assert.equal(rl.check("a").allowed, false);
  assert.equal(rl.check("b").allowed, true);
  assert.equal(rl.check("b").remaining, 2);
});

test("RateLimiter: sliding window frees hits as they expire", () => {
  const c = clock();
  const rl = new RateLimiter({ limit: 2, windowMs: 1000 }, c.now);
  rl.hit("a"); // t=0
  c.advance(600);
  rl.hit("a"); // t=600
  assert.equal(rl.check("a").allowed, false);
  assert.equal(rl.check("a").retryAfterMs, 400);
  c.advance(401); // first hit expired
  assert.equal(rl.check("a").allowed, true);
  assert.equal(rl.check("a").remaining, 1);
  c.advance(600); // both expired → key forgotten
  assert.equal(rl.check("a").remaining, 2);
  assert.equal(rl.size, 0);
});

test("RateLimiter: reset clears a key (successful login)", () => {
  const c = clock();
  const rl = new RateLimiter({ limit: 1, windowMs: 1000 }, c.now);
  rl.hit("a");
  assert.equal(rl.check("a").allowed, false);
  rl.reset("a");
  assert.equal(rl.check("a").allowed, true);
});

test("RateLimiter: memory is bounded by maxKeys", () => {
  const c = clock();
  const rl = new RateLimiter({ limit: 5, windowMs: 60_000 }, c.now, 100);
  for (let i = 0; i < 1000; i++) rl.hit(`k${i}`);
  assert.ok(rl.size <= 100, `size ${rl.size}`);
  // The most recent keys survive eviction.
  assert.equal(rl.check("k999").remaining, 4);
});

const hdrs = (o: Record<string, string>) => ({ get: (n: string) => o[n.toLowerCase()] ?? null });

test("clientIp: x-real-ip, then right-most x-forwarded-for, else unknown", () => {
  assert.equal(clientIp(hdrs({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.1.1.1" })), "203.0.113.9");
  // Left-most XFF entries are client-supplied; the proxy appends the real one last.
  assert.equal(clientIp(hdrs({ "x-forwarded-for": "6.6.6.6, 198.51.100.7" })), "198.51.100.7");
  assert.equal(clientIp(hdrs({ "x-forwarded-for": " 198.51.100.7 " })), "198.51.100.7");
  assert.equal(clientIp(hdrs({})), "unknown");
});

test("isDemoEmail: only the reserved holicruit.test domain", () => {
  assert.equal(isDemoEmail("priya@holicruit.test"), true);
  assert.equal(isDemoEmail("  Sam@HOLICRUIT.test "), true);
  assert.equal(isDemoEmail("someone@holicruit.com"), false);
  assert.equal(isDemoEmail("holicruit.test@gmail.com"), false);
  assert.equal(isDemoEmail("x@sub.holicruit.test.evil.com"), false);
  assert.equal(isDemoEmail(""), false);
  assert.equal(isDemoEmail(null), false);
  assert.equal(isDemoEmail(undefined), false);
});

test("sameWorld: demo↔demo and real↔real only", () => {
  assert.equal(sameWorld("sam@holicruit.test", "priya@holicruit.test"), true);
  assert.equal(sameWorld("anna@example.com", "hm@corp.example"), true);
  assert.equal(sameWorld("sam@holicruit.test", "hm@corp.example"), false);
  assert.equal(sameWorld("anna@example.com", "priya@holicruit.test"), false);
});
