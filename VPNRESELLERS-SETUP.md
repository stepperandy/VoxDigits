# VoxVPN repair and VPNresellers pilot

This source update is not deployed and is not a new Android APK or iPhone build.

## What changed
- /vpn-servers now fetches provider locations and downloads OpenVPN/WireGuard profiles through the authenticated vpnResellers backend function.
- The dashboard Connect action opens that page.
- Removed simulated success from browser/native fallback and old connection service. Profile downloads never claim a live tunnel.
- Removed provider API keys and TLS authentication keys from getServersHybrid responses and required authentication.
- Added admin-only VPNResellerAssignment records. The backend selects an account by authenticated user email, never by a client-supplied account ID.
- Provider requests use a fixed HTTPS origin, timeout, no redirects, sanitized errors, and no-store responses.

## Pilot activation (administrator)
1. Import/deploy the updated source, vpnResellers function and VPNResellerAssignment entity into the existing VoxVPN Base44 project. Deploy getServersHybrid too.
2. In backend secrets set VPNRESELLERS_API_TOKEN. Do not use a VITE_ variable or paste the key into frontend code.
3. For OpenVPN set VPNRESELLERS_OPENVPN_PORT_ID to an actual port ID from GET https://api.vpnresellers.com/v4_1/ports. This is an ID, not a network port number. WireGuard does not need this setting.
4. Create a pilot VPN account in the reseller dashboard after checking funding/pricing. Set its provider expiry; do not leave it on indefinite auto-renewal.
5. Create one enabled VPNResellerAssignment with the subscriber's exact login email, numeric provider account_id and access_until (ISO timestamp). Provider expiry must be in the future and no later than access_until. This assignment is the pilot entitlement, independent of existing payment records.
6. For OpenVPN, securely give the subscriber their individual VPN account username/password. These are not their VoxVPN login or the reseller API token. WireGuard profiles contain the account's private key: treat downloaded profiles as credentials.
7. Log in as the assigned user, open /vpn-servers, select protocol and download. Import .ovpn into OpenVPN Connect or .conf into WireGuard and connect in that app.
8. Verify public IP changes, DNS/IPv6 behavior, reconnect, location selection and actual provider-side expiry on a device.

Account creation, renewal, suspension, cancellation and refunds are MANUAL for this pilot. Changing an assignment blocks new downloads but does NOT revoke an already downloaded profile. Disable the provider account to revoke access immediately. Do not launch automated paid subscriptions until billing webhooks, reconciliation, device limits and provider lifecycle operations are implemented and tested.

## Existing native build blockers
- src/android includes a VoxVpnPlugin referencing Capacitor and ICS-OpenVPN, but its supplied Gradle dependencies/settings do not include those modules.
- Root android contains only a ProGuard file. iOS contains entitlements/plists without a complete tunnel implementation/project.
- The existing APK in public/installers is unchanged, not rebuilt or verified by this repair.
- The plugin accepts bundled asset names; it does not yet accept provider configurations. This update deliberately uses external VPN clients rather than pretending native integration is complete.
- Other legacy setup/download routes remain and have not been certified. Do not treat this pilot as a full product/security audit.

## Validation
Run: node tests/vpn-resellers.test.mjs
Seven mocked tests passed: authentication, secret filtering, missing entitlement, cross-account protection, disabled account, provider error redaction, and browser refusal to simulate a connection.
No live provider calls or device tunnel tests were possible without credentials and an assigned account. Full frontend/native builds were not run: dependencies are absent and the npm registry was inaccessible in this execution environment.

Documentation: https://api.vpnresellers.com/docs/v4_1/
