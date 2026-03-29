import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PLATFORMS = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Router'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch existing setups
    const existing = await base44.asServiceRole.entities.Download.filter({ type: 'setup' }, '', 1000);
    const existingPlatforms = new Set(existing.map(s => s.platform));

    // Generate setups for missing platforms
    const created = [];
    for (const platform of PLATFORMS) {
      if (!existingPlatforms.has(platform)) {
        const setup = await base44.asServiceRole.entities.Download.create({
          name: `VoxVPN ${platform}`,
          platform,
          type: 'setup',
          file_url: `/setup?platform=${platform.toLowerCase()}`,
          description: `Setup portal for VoxVPN on ${platform}`,
          is_free: true,
          is_active: true,
          version: '1.0.0',
        });
        created.push(setup);
      }
    }

    return Response.json({
      message: `${created.length} setups generated`,
      created: created.map(s => ({ id: s.id, name: s.name, platform: s.platform })),
      existing: existing.length,
      total: existing.length + created.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});