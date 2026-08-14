const MCP_PUBLIC_PATH = "/api/mcp";
const MCP_ORIGIN_PATH = "/api/functions/mcp";
const CHALLENGE_PATH = "/.well-known/openai-apps-challenge";

function plainText(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    if (incomingUrl.pathname === CHALLENGE_PATH) {
      const token = String(env.OPENAI_APPS_CHALLENGE_TOKEN || "").trim();
      if (!token) return plainText("Challenge token not configured", 503);
      return plainText(token);
    }

    if (
      incomingUrl.pathname !== MCP_PUBLIC_PATH &&
      !incomingUrl.pathname.startsWith(`${MCP_PUBLIC_PATH}/`)
    ) {
      return plainText("Not found", 404);
    }

    const originUrl = new URL(request.url);
    originUrl.pathname = `${MCP_ORIGIN_PATH}${incomingUrl.pathname.slice(MCP_PUBLIC_PATH.length)}`;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.set("x-forwarded-host", incomingUrl.host);
    headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const response = await fetch(originUrl.toString(), init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("cache-control", "no-store");
    responseHeaders.set("x-voxtelefony-mcp-router", "1");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
