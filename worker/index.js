// ZordPath Cloud Save Backup Worker
// Stores save game backups in Cloudflare KV with version history

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POST /save — backup a save
    if (request.method === 'POST' && url.pathname === '/save') {
      try {
        const body = await request.json();
        const { machineId, characterId, saveData } = body;
        if (!machineId || !characterId || !saveData) {
          return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: corsHeaders });
        }

        const timestamp = new Date().toISOString();
        const backupKey = `${machineId}:${characterId}:${timestamp}`;

        // Store the backup
        await env.SAVES.put(backupKey, JSON.stringify(saveData), {
          expirationTtl: 60 * 60 * 24 * 90 // Keep for 90 days
        });

        // Also store as "latest" for quick access
        const latestKey = `${machineId}:${characterId}:latest`;
        await env.SAVES.put(latestKey, JSON.stringify({ ...saveData, _backupTime: timestamp }));

        // Store backup index (list of timestamps for this machine+character)
        const indexKey = `${machineId}:${characterId}:index`;
        const existingIndex = await env.SAVES.get(indexKey);
        const index = existingIndex ? JSON.parse(existingIndex) : [];
        index.push(timestamp);
        // Keep last 20 backups in index
        while (index.length > 20) index.shift();
        await env.SAVES.put(indexKey, JSON.stringify(index));

        return new Response(JSON.stringify({ ok: true, backupKey, timestamp }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // GET /saves?machineId=X&characterId=Y — list backups
    if (request.method === 'GET' && url.pathname === '/saves') {
      const machineId = url.searchParams.get('machineId');
      const characterId = url.searchParams.get('characterId');
      if (!machineId || !characterId) {
        return new Response(JSON.stringify({ error: 'Missing machineId or characterId' }), { status: 400, headers: corsHeaders });
      }

      const indexKey = `${machineId}:${characterId}:index`;
      const existing = await env.SAVES.get(indexKey);
      const index = existing ? JSON.parse(existing) : [];

      return new Response(JSON.stringify({ backups: index }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /restore?machineId=X&characterId=Y&timestamp=Z — restore a specific backup
    if (request.method === 'GET' && url.pathname === '/restore') {
      const machineId = url.searchParams.get('machineId');
      const characterId = url.searchParams.get('characterId');
      const timestamp = url.searchParams.get('timestamp') || 'latest';

      const key = `${machineId}:${characterId}:${timestamp}`;
      const data = await env.SAVES.get(key);
      if (!data) {
        return new Response(JSON.stringify({ error: 'Backup not found' }), { status: 404, headers: corsHeaders });
      }

      return new Response(data, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ status: 'ZordPath Save Service', routes: ['/save', '/saves', '/restore'] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};
