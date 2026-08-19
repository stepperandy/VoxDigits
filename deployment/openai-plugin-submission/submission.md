# VoxTelefony — OpenAI Plugin Submission

## Listing information

- **Plugin name:** VoxTelefony
- **Developer:** VoxDigits Communications LLC
- **Primary category:** Business
- **Secondary category:** Productivity or Communication, if available
- **Website:** https://voxtelefony.com
- **Support URL:** https://voxtelefony.com/support
- **Privacy policy:** https://voxtelefony.com/privacypolicy
- **Terms of service:** https://voxtelefony.com/termsofservice
- **Production MCP URL:** https://voxtelefony.com/api/mcp
- **Connection type:** Universal URL
- **Authentication:** None for version 1.0; public read-only information only
- **Availability:** Public

## Short description

Find virtual phone numbers, eSIM plans, and retail voice or messaging rates from VoxTelefony.

## Full description

VoxTelefony helps users explore public telecommunications services through ChatGPT. Users can check live virtual-number availability, browse eSIM plans, and retrieve published retail pricing for virtual numbers and calling services. The plugin is read-only: it cannot access private accounts, contacts, messages, call records, balances, credentials, or billing data, and it cannot purchase numbers, activate services, place calls, or send messages.

## Tool scope

1. `search_virtual_numbers` — Searches live carrier inventory for public virtual-number availability.
2. `get_service_pricing` — Returns published retail pricing for supported VoxTelefony services.
3. `list_esim_plans` — Lists public eSIM plans by destination.
4. `get_call_rates` — Returns published inbound and outbound voice rates.

All tools are annotated as read-only, non-destructive, idempotent, and open-world because they retrieve current public information from VoxTelefony or its service providers.

## Release notes

Initial public release of the VoxTelefony read-only plugin. This release provides public virtual-number availability, eSIM plan discovery, service pricing, and voice-rate information. It does not authenticate users, access private account or communications data, or execute purchases, activations, calls, or messages.

## Reviewer notes

- No reviewer account is required.
- All tools operate without authentication and expose public catalogue information only.
- The plugin intentionally contains no write tools.
- Requests to buy a number, send a message, place a call, activate an eSIM, inspect an account, or retrieve private communications must not trigger an action.
- A live carrier may occasionally return no matching number inventory. That is a valid empty result and should be explained to the user without inventing availability.
- Pricing is displayed in USD unless a tool response explicitly states another currency.

## Domain verification

The OpenAI challenge token is served as plain text at:

https://voxtelefony.com/.well-known/openai-apps-challenge

Set the generated token as the Cloudflare Worker secret `OPENAI_APPS_CHALLENGE_TOKEN` before selecting Verify in the submission portal.
