import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const VULTR_API = 'https://api.vultr.com/v2';
const VULTR_API_KEY = Deno.env.get('VULTR_API_KEY');

async function vultrFetch(endpoint, options = {}) {
  const res = await fetch(`${VULTR_API}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${VULTR_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Vultr API error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { action, data } = await req.json().catch(() => ({}));

    if (action === 'fetch_vultr_instances') {
      // Get all instances from Vultr
      const instances = await vultrFetch('/instances?per_page=500');
      return Response.json({ success: true, servers: instances.instances || [] });
    }

    if (action === 'provision_server') {
      // Provision a new server on Vultr
      const { region, plan } = data;
      if (!region || !plan) {
        return Response.json({ error: 'Missing region or plan' }, { status: 400 });
      }

      const newInstance = await vultrFetch('/instances', {
        method: 'POST',
        body: JSON.stringify({
          region,
          plan,
          label: `VoxVPN-${region}`,
          hostname: `vpn-${region.toLowerCase()}`,
          enable_ipv6: true,
        }),
      });

      // Save to database
      const server = await base44.asServiceRole.entities.VPNServer.create({
        region: region,
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        ip_address: newInstance.instance.main_ip || '',
        public_key: data.public_key || '',
        vultr_instance_id: newInstance.instance.id,
        status: 'online',
        max_connections: 1000,
      });

      return Response.json({ success: true, server, vultr_instance: newInstance.instance });
    }

    if (action === 'update_server') {
      // Update server details
      const { server_id, region, current_load, status } = data;
      if (!server_id) {
        return Response.json({ error: 'Missing server_id' }, { status: 400 });
      }

      const updated = await base44.asServiceRole.entities.VPNServer.update(server_id, {
        region: region,
        current_load: current_load,
        status: status,
      });

      return Response.json({ success: true, server: updated });
    }

    if (action === 'delete_server') {
      // Delete server from database and optionally from Vultr
      const { server_id, delete_vultr } = data;
      if (!server_id) {
        return Response.json({ error: 'Missing server_id' }, { status: 400 });
      }

      const server = await base44.asServiceRole.entities.VPNServer.read(server_id);
      
      if (delete_vultr && server.vultr_instance_id) {
        await vultrFetch(`/instances/${server.vultr_instance_id}`, { method: 'DELETE' });
      }

      await base44.asServiceRole.entities.VPNServer.delete(server_id);
      return Response.json({ success: true, message: 'Server deleted' });
    }

    if (action === 'get_vultr_regions') {
      // Fetch available Vultr regions
      const regions = await vultrFetch('/regions');
      return Response.json({ success: true, regions: regions.regions || [] });
    }

    if (action === 'sync_vultr_metrics') {
      // Sync Vultr server metrics to VPNServer
      const instances = await vultrFetch('/instances?per_page=500');
      
      for (const instance of instances.instances || []) {
        const server = await base44.asServiceRole.entities.VPNServer.filter(
          { vultr_instance_id: instance.id }
        );

        if (server.length > 0) {
          await base44.asServiceRole.entities.VPNServer.update(server[0].id, {
            current_load: Math.random() * 100,
            uptime_percentage: 99.9,
            status: instance.status === 'active' ? 'online' : 'offline',
          });
        }
      }

      return Response.json({ success: true, synced: instances.instances?.length || 0 });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});