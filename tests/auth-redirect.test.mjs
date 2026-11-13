// Regression tests for the centralized auth redirect validator.
// Run with: node --test tests/auth-redirect.test.mjs

import test from "node:test";
import assert from "node:assert/strict";

const ORIGIN = "https://voxvpn.net";

globalThis.window = {
  location: { origin: ORIGIN, search: "" },
};

const { sanitizeRedirect, resolveNextPath, safeReturnTo } = await import(
  "../src/lib/authReturnTo.js"
);

const setSearch = (search) => {
  globalThis.window.location.search = search;
};

test("blocks javascript: and other script-bearing schemes", () => {
  assert.equal(sanitizeRedirect("javascript:alert(1)"), "/");
  assert.equal(sanitizeRedirect("JaVaScRiPt:alert(document.domain)"), "/");
  assert.equal(sanitizeRedirect(" javascript:alert(1)"), "/");
  assert.equal(sanitizeRedirect("java\nscript:alert(1)"), "/");
  assert.equal(sanitizeRedirect("data:text/html,<script>alert(1)</script>"), "/");
  assert.equal(sanitizeRedirect("vbscript:msgbox(1)"), "/");
});

test("blocks external and protocol-relative destinations", () => {
  assert.equal(sanitizeRedirect("https://evil.example/phish"), "/");
  assert.equal(sanitizeRedirect("http://evil.example"), "/");
  assert.equal(sanitizeRedirect("//evil.example"), "/");
  assert.equal(sanitizeRedirect("///evil.example"), "/");
  assert.equal(sanitizeRedirect("/\\evil.example"), "/");
  assert.equal(sanitizeRedirect("mailto:attacker@evil.example"), "/");
});

test("blocks relative and malformed values", () => {
  assert.equal(sanitizeRedirect("dashboard"), "/");
  assert.equal(sanitizeRedirect(""), "/");
  assert.equal(sanitizeRedirect(null), "/");
  assert.equal(sanitizeRedirect(undefined), "/");
  assert.equal(sanitizeRedirect({}), "/");
});

test("allows legitimate same-origin app paths", () => {
  assert.equal(sanitizeRedirect("/dashboard"), "/dashboard");
  assert.equal(sanitizeRedirect("/dashboard?tab=billing"), "/dashboard?tab=billing");
  assert.equal(sanitizeRedirect("/business/dashboard"), "/business/dashboard");
  assert.equal(sanitizeRedirect("/oauth/consent?ctx=abc"), "/oauth/consent?ctx=abc");
  assert.equal(sanitizeRedirect("/pricing#plans"), "/pricing#plans");
});

test("honors a custom fallback for rejected values", () => {
  assert.equal(
    sanitizeRedirect("javascript:alert(1)", "/business/dashboard"),
    "/business/dashboard"
  );
  assert.equal(
    sanitizeRedirect("https://evil.example", "/business/dashboard"),
    "/business/dashboard"
  );
});

test("resolveNextPath validates next and from_url", () => {
  setSearch("?next=javascript:alert(1)");
  assert.equal(resolveNextPath("/dashboard"), "/dashboard");

  setSearch("?next=//evil.example");
  assert.equal(resolveNextPath("/dashboard"), "/dashboard");

  setSearch("?next=/dashboard?tab=billing");
  assert.equal(resolveNextPath("/business/dashboard"), "/dashboard?tab=billing");

  setSearch("?from_url=https://evil.example");
  assert.equal(resolveNextPath("/business/dashboard"), "/business/dashboard");

  setSearch("?from_url=/business/dashboard");
  assert.equal(resolveNextPath("/business/dashboard"), "/business/dashboard");

  setSearch("");
  assert.equal(resolveNextPath("/dashboard"), "/dashboard");
});

test("safeReturnTo keeps its stricter contract", () => {
  setSearch("");
  assert.equal(safeReturnTo(), "/");

  setSearch("?returnTo=/oauth/consent?ctx=abc");
  assert.equal(safeReturnTo(), "/oauth/consent?ctx=abc");

  setSearch("?returnTo=javascript:alert(1)");
  assert.equal(safeReturnTo(), "/");

  setSearch("?returnTo=/.//evil.example");
  assert.equal(safeReturnTo(), "/");

  setSearch("?returnTo=//evil.example");
  assert.equal(safeReturnTo(), "/");
});