# VoxTelefony MCP edge router

This Worker preserves the public submission URL:

- Public MCP URL: `https://voxtelefony.com/api/mcp`
- Safe Base44 origin: `https://voxtelefony.com/api/functions/mcp`
- OpenAI verification path: `https://voxtelefony.com/.well-known/openai-apps-challenge`

Only the two declared routes are handled by the Worker. All other VoxTelefony traffic remains on Base44.

## One-time setup

1. Add `voxtelefony.com` to Cloudflare and import the existing DNS records.
2. Preserve the current production records:
   - Apex `A`: `216.24.57.1`
   - `www` `CNAME`: `base44.onrender.com`
3. Change the domain nameservers at Namecheap to the two nameservers assigned by Cloudflare.
4. In this directory run:

```bash
npx wrangler login
npx wrangler deploy
```

5. When the OpenAI submission portal generates the domain challenge token, save it without quotes:

```bash
npx wrangler secret put OPENAI_APPS_CHALLENGE_TOKEN
```

## Verification

```bash
curl -i https://voxtelefony.com/api/mcp
curl -i https://voxtelefony.com/.well-known/openai-apps-challenge
```

The MCP response should contain `"name":"VoxTelefony"` and `"version":"1.1.0"`. The challenge endpoint must return only the exact OpenAI token as plain text.

Test MCP initialization:

```bash
curl -sS -X POST https://voxtelefony.com/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"verification","version":"1.0"}}}'
```

Test the tool catalogue:

```bash
curl -sS -X POST https://voxtelefony.com/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

The catalogue must contain only the four approved read-only tools.
