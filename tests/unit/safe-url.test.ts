import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkPublicUrl,
  isBlockedHostname,
  isBlockedIp,
  parsePublicUrl,
  safeFetch,
  UnsafeUrlError,
  type Resolver,
  type Transport,
} from "../../src/lib/net/safe-url";

/** Fake DNS: hostname → addresses. Unknown names fail like NXDOMAIN. */
function fakeDns(map: Record<string, string[]>): Resolver {
  return async (host) => {
    const addrs = map[host];
    if (!addrs) throw Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" });
    return addrs.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  };
}

test("isBlockedIp: IPv4 private / special ranges", () => {
  for (const ip of [
    "127.0.0.1",
    "127.1.2.3",
    "10.0.0.1",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "100.127.255.254",
    "0.0.0.0",
    "224.0.0.1",
    "239.255.255.250",
    "255.255.255.255",
    "198.18.0.1",
  ]) {
    assert.equal(isBlockedIp(ip), true, ip);
  }
});

test("isBlockedIp: public IPv4 allowed", () => {
  for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "100.128.0.1", "93.184.216.34"]) {
    assert.equal(isBlockedIp(ip), false, ip);
  }
});

test("isBlockedIp: IPv6 loopback, ULA, link-local, multicast, mapped", () => {
  for (const ip of [
    "::1",
    "::",
    "[::1]",
    "fd00::1",
    "fc12:3456::1",
    "fe80::1",
    "fe80::1%eth0",
    "ff02::1",
    "::ffff:127.0.0.1",
    "::ffff:8.8.8.8", // all IPv4-mapped are refused
    "::ffff:7f00:1",
    "64:ff9b::a9fe:a9fe", // NAT64 → 169.254.169.254
    "2002:7f00:0001::1", // 6to4 of 127.0.0.1
    "2001:db8::1",
  ]) {
    assert.equal(isBlockedIp(ip), true, ip);
  }
});

test("isBlockedIp: public IPv6 allowed, garbage refused", () => {
  assert.equal(isBlockedIp("2606:4700:4700::1111"), false);
  assert.equal(isBlockedIp("2a00:1450:4001:80b::200e"), false);
  assert.equal(isBlockedIp("not-an-ip"), true);
  assert.equal(isBlockedIp("999.1.1.1"), true);
});

test("isBlockedHostname", () => {
  for (const h of [
    "localhost",
    "LOCALHOST.",
    "foo.localhost",
    "printer.local",
    "postgres.railway.internal",
    "metadata.google.internal",
    "postgres",
  ]) {
    assert.equal(isBlockedHostname(h), true, h);
  }
  assert.equal(isBlockedHostname("jobs.ch"), false);
  assert.equal(isBlockedHostname("www.linkedin.com"), false);
});

test("parsePublicUrl: scheme, credentials, port, IP literal", () => {
  assert.deepEqual(parsePublicUrl("ftp://example.com/").ok, false);
  assert.deepEqual(parsePublicUrl("file:///etc/passwd").ok, false);
  assert.deepEqual(parsePublicUrl("javascript:alert(1)").ok, false);
  assert.deepEqual(parsePublicUrl("not a url").ok, false);
  const creds = parsePublicUrl("https://user:pw@example.com/");
  assert.equal(creds.ok || creds.reason, "credentials");
  const port = parsePublicUrl("http://example.com:8080/");
  assert.equal(port.ok || port.reason, "port");
  assert.equal(parsePublicUrl("https://example.com:443/x").ok, true);
  assert.equal(parsePublicUrl("http://example.com:80/x").ok, true);
  // WHATWG URL normalises decimal / hex IPv4 forms, so these are caught too.
  for (const u of ["http://2130706433/", "http://0x7f.0.0.1/", "http://[::1]/", "http://[::ffff:127.0.0.1]/", "http://169.254.169.254/latest/meta-data"]) {
    const r = parsePublicUrl(u);
    assert.equal(r.ok, false, u);
  }
});

test("checkPublicUrl: DNS answers are checked, one private record is enough to refuse", async () => {
  const dns = fakeDns({
    "jobs.example.com": ["93.184.216.34", "2606:2800:220:1::1"],
    "localtest.me": ["127.0.0.1"],
    "mixed.example.com": ["93.184.216.34", "10.0.0.5"],
    "v6internal.example.com": ["fd12::5"],
  });
  const ok = await checkPublicUrl("https://jobs.example.com/role/1", dns);
  assert.equal(ok.ok, true);
  for (const [u, reason] of [
    ["http://localtest.me/", "address"],
    ["http://mixed.example.com/", "address"],
    ["http://v6internal.example.com/", "address"],
    ["http://nxdomain.example.com/", "dns"],
    ["http://postgres.railway.internal/", "hostname"],
  ] as const) {
    const r = await checkPublicUrl(u, dns);
    assert.equal(r.ok ? "ok" : r.reason, reason, u);
  }
});

test("safeFetch: follows a public redirect, refuses a redirect into the private network", async () => {
  const dns = fakeDns({ "a.example.com": ["93.184.216.34"], "b.example.com": ["93.184.216.35"] });
  const seen: string[] = [];
  const transport: Transport = async (url) => {
    seen.push(url.toString());
    if (url.hostname === "a.example.com" && url.pathname === "/ok") {
      return { status: 302, headers: { location: "https://b.example.com/final" }, body: "" };
    }
    if (url.hostname === "a.example.com" && url.pathname === "/evil") {
      return { status: 301, headers: { location: "http://169.254.169.254/latest/meta-data/" }, body: "" };
    }
    if (url.hostname === "a.example.com" && url.pathname === "/evil6") {
      return { status: 307, headers: { location: "http://[::1]:80/" }, body: "" };
    }
    return { status: 200, headers: {}, body: "hello" };
  };

  const good = await safeFetch("https://a.example.com/ok", { resolve: dns, transport });
  assert.equal(good.ok, true);
  assert.equal(good.text, "hello");
  assert.equal(good.url.hostname, "b.example.com");

  await assert.rejects(safeFetch("https://a.example.com/evil", { resolve: dns, transport }), UnsafeUrlError);
  await assert.rejects(safeFetch("https://a.example.com/evil6", { resolve: dns, transport }), UnsafeUrlError);
  assert.ok(!seen.some((u) => u.includes("169.254") || u.includes("[::1]")), "never contacted the internal target");
});

test("safeFetch: redirect loop is capped", async () => {
  const dns = fakeDns({ "loop.example.com": ["93.184.216.34"] });
  let calls = 0;
  const transport: Transport = async () => {
    calls++;
    return { status: 302, headers: { location: "/again" }, body: "" };
  };
  await assert.rejects(
    safeFetch("https://loop.example.com/", { resolve: dns, transport, maxRedirects: 3 }),
    (e: unknown) => e instanceof UnsafeUrlError && e.reason === "redirects",
  );
  assert.equal(calls, 4); // first request + 3 redirects
});
