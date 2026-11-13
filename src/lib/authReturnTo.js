// Shared by the auth pages (Login, Register, and any page that resumes a flow
// after sign-in, e.g. the MCP OAuth consent page). Keep the redirect
// validation in one place — it is security-sensitive and easy to drift.

// Validate one redirect target. Only same-origin, absolute application paths
// survive; anything else returns the fallback.
//
// Rejected on purpose:
//  - any scheme (javascript:, data:, vbscript:, http:, https:, mailto:), which
//    is how a post-login "next" turns into script execution or an open redirect
//  - protocol-relative //evil.com and backslash /\evil.com destinations, which
//    same-origin parsing alone lets through but the browser resolves off-site
//  - relative values ("dashboard"), malformed URLs, and control-character
//    smuggling ("java\nscript:...")
export function sanitizeRedirect(raw, fallback = "/") {
  if (typeof raw !== "string") return fallback;
  const value = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!value) return fallback;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    if (url.origin !== window.location.origin) return fallback;
    const path = url.pathname + url.search + url.hash;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

// Resolve the first present ?next= / ?from_url= target through the validator,
// else the page's own fallback destination.
export function resolveNextPath(fallback = "/", paramNames = ["next", "from_url"]) {
  const search = new URLSearchParams(window.location.search);
  for (const name of paramNames) {
    const raw = search.get(name);
    if (raw) return sanitizeRedirect(raw, fallback);
  }
  return fallback;
}

// Resolve ?returnTo= to a safe same-origin path, else "/".
//
// The same-origin check alone is not enough: a value like /.//evil.com or
// /\evil.com parses same-origin but normalizes to a protocol-relative
// //evil.com when assigned to location.href — an open redirect. So require the
// resolved path to be exactly one leading slash (no "//" prefix, no backslash).
export function safeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get("returnTo");
  if (!raw) return "/";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    // Only access_token/clear_access_token are still URL-read by app-params.js, but the
    // whole bootstrap set stays stripped: one going back to a URL read must not silently
    // become injectable again. Normal app-flow params (e.g. the OAuth consent ctx) are kept.
    for (const p of ["access_token", "clear_access_token", "app_id", "app_base_url", "functions_version", "from_url"]) {
      url.searchParams.delete(p);
    }
    return sanitizeRedirect(url.pathname + url.search, "/");
  } catch {
    return "/";
  }
}