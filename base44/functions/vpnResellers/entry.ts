import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Pilot integration. Accounts are assigned by an administrator, never by the caller.
export function makeHandler(createClient, env, request = fetch) {
  return async (req) => {
    const reply = (body, status = 200) => Response.json(body, {
      status, headers: { 'Cache-Control': 'no-store', 'Pragma': 'no-cache' },
    });
    try {
      if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
      const client = createClient(req);
      const user = await client.auth.me().catch(() => null);
      if (!user) return reply({ error: 'Sign in to use VoxVPN.' }, 401);
      const token = env('VPNRESELLERS_API_TOKEN');
      if (!token) return reply({ error: 'VPN provider is not configured. Contact support.' }, 503);
      const body = await req.json().catch(() => ({}));
      const api = async (path) => {
        const response = await request(`https://api.vpnresellers.com/v4_1${path}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(15000), redirect: 'error',
        });
        if (!response.ok) throw new Error('PROVIDER_UNAVAILABLE');
        return (await response.json()).data;
      };
      if (body.action === 'servers') {
        const rows = await api('/servers');
        if (!Array.isArray(rows)) throw new Error('INVALID_PROVIDER_RESPONSE');
        return reply({ servers: rows.map(s => ({ id: s.id, name: `${s.city || s.name} (${s.country_code || ''})` })) });
      }
      if (body.action !== 'config' || !/^[1-9]\d*$/.test(String(body.serverId))) {
        return reply({ error: 'Choose a valid server.' }, 400);
      }
      const protocol = body.protocol;
      if (!['openvpn', 'wireguard'].includes(protocol)) return reply({ error: 'Unsupported protocol.' }, 400);
      const assignments = await client.asServiceRole.entities.VPNResellerAssignment.filter({ user_email: user.email });
      const assignment = assignments.find(a => a.enabled && (a.no_expiry === true || Date.parse(a.access_until) > Date.now()));
      if (!assignment || !/^[1-9]\d*$/.test(String(assignment.account_id))) {
        return reply({ error: 'Your VPN account needs activation or renewal. Contact support.' }, 403);
      }
      const account = await api(`/accounts/${assignment.account_id}`);
      // Explicit admin-approved no-expiry assignments may use auto-renewal accounts.
      const expires = Date.parse(account?.expired_at);
      const providerHasExpiry = account?.expired_at != null;
      const providerExpired = providerHasExpiry && (!Number.isFinite(expires) || expires <= Date.now());
      const exceedsAssignment = assignment.no_expiry !== true &&
        (!providerHasExpiry || expires > Date.parse(assignment.access_until));
      if (account?.status !== 'Active' || providerExpired || exceedsAssignment) {
        return reply({ error: 'Your provider account expiry needs review. Contact support.' }, 403);
      }
      let query = `server_id=${encodeURIComponent(body.serverId)}`;
      if (protocol === 'wireguard') query += `&account_id=${assignment.account_id}`;
      else {
        const port = env('VPNRESELLERS_OPENVPN_PORT_ID');
        if (!port || !/^[1-9]\d*$/.test(port)) return reply({ error: 'OpenVPN port is not configured.' }, 503);
        query += `&port_id=${port}`;
      }
      const config = await api(`/configuration/${protocol}?${query}`);
      if (typeof config?.content !== 'string' ||
          !(protocol === 'wireguard' ? config.content.includes('[Interface]') : /^client\s*$/m.test(config.content))) {
        throw new Error('INVALID_PROVIDER_RESPONSE');
      }
      return reply({ content: config.content, filename: `VoxVPN-${body.serverId}.${protocol === 'wireguard' ? 'conf' : 'ovpn'}` });
    } catch {
      return reply({ error: 'VPN service could not complete the request. Please retry or contact support.' }, 502);
    }
  };
}
Deno.serve(makeHandler(createClientFromRequest, name => Deno.env.get(name)));
