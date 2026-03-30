import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const EMPTY = { name: '', serverId: '', country: '', city: '', host: '', port: '51820', publicKey: '', apiToken: '', status: 'active', notes: '' };

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildConf(s) {
  return `[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = 10.0.0.2/32
DNS = 1.1.1.1

[Peer]
PublicKey = ${s.publicKey || '<MISSING_SERVER_PUBLIC_KEY>'}
Endpoint = ${s.host || '<SERVER_IP>'}:${s.port || '51820'}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;
}

function buildSSH(s) {
  const host = s.host || 'YOUR_SERVER_IP';
  return `Run one of these on the server ${host}:

sudo cat /etc/wireguard/publickey

If that file does not exist:
sudo sh -c 'cat /etc/wireguard/privatekey | wg pubkey'

Then paste the output into the PublicKey field for ${s.name || 'this server'}.`;
}

export default function VPNServerEditor() {
  const [servers, setServers] = useState([]);
  const [selected, setSelected] = useState(-1);
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState('Select a server and click "Preview .conf".');
  const [validation, setValidation] = useState('No validation run yet.');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadServers(); }, []);

  const loadServers = async () => {
    const list = await base44.entities.VPNServer.list();
    // normalize to editor shape
    const mapped = list.map(s => ({
      _id: s.id,
      name: s.region || '',
      serverId: s.vultr_instance_id || s.id,
      country: s.country || '',
      city: s.city || '',
      host: s.ip_address || '',
      port: String(s.port || 51820),
      publicKey: s.public_key || '',
      apiToken: s.api_token || '',
      status: s.status || 'active',
      notes: '',
    }));
    setServers(mapped);
    runValidation(mapped);
    if (mapped.length) selectServer(0, mapped);
  };

  const selectServer = (index, list = servers) => {
    setSelected(index);
    setForm(list[index]);
    setPreview(buildConf(list[index]));
  };

  const saveServer = async () => {
    if (!form.name || !form.host) { alert('Name and Host are required.'); return; }
    setSaving(true);
    try {
      const payload = {
        region: form.name,
        country: form.country,
        city: form.city,
        ip_address: form.host,
        port: parseInt(form.port) || 51820,
        public_key: form.publicKey,
        api_token: form.apiToken,
        status: form.status === 'active' ? 'online' : form.status,
        vultr_instance_id: form.serverId,
      };

      let updated;
      if (form._id) {
        updated = await base44.entities.VPNServer.update(form._id, payload);
      } else {
        updated = await base44.entities.VPNServer.create(payload);
      }

      await loadServers();
      setPreview(buildConf(form));
    } finally {
      setSaving(false);
    }
  };

  const deleteServer = async () => {
    if (!form._id || !window.confirm('Delete this server?')) return;
    await base44.entities.VPNServer.delete(form._id);
    setSelected(-1);
    setForm(EMPTY);
    await loadServers();
  };

  const runValidation = (list = servers) => {
    if (!list.length) { setValidation('No servers found.'); return; }
    const lines = list.map((s, i) => {
      const problems = [];
      if (!s.name) problems.push('missing name');
      if (!s.host) problems.push('missing host');
      if (!(s.publicKey || '').trim()) problems.push('missing PublicKey ⚠️');
      return problems.length
        ? `${i + 1}. ${s.name || 'Untitled'} → NOT READY: ${problems.join(', ')}`
        : `${i + 1}. ${s.name} → ✅ READY`;
    });
    setValidation(lines.join('\n'));
  };

  const loadSample = async () => {
    const samples = [
      { region: 'New York 1', country: 'US', city: 'New York', ip_address: '203.0.113.11', port: 51820, public_key: '', status: 'online' },
      { region: 'Los Angeles 1', country: 'US', city: 'Los Angeles', ip_address: '203.0.113.12', port: 51820, public_key: '', status: 'online' },
      { region: 'London 1', country: 'UK', city: 'London', ip_address: '203.0.113.13', port: 51820, public_key: '', status: 'online' },
      { region: 'Frankfurt 1', country: 'DE', city: 'Frankfurt', ip_address: '203.0.113.14', port: 51820, public_key: '', status: 'online' },
      { region: 'Paris 1', country: 'FR', city: 'Paris', ip_address: '203.0.113.15', port: 51820, public_key: '', status: 'online' },
      { region: 'Amsterdam 1', country: 'NL', city: 'Amsterdam', ip_address: '203.0.113.16', port: 51820, public_key: '', status: 'online' },
      { region: 'Toronto 1', country: 'CA', city: 'Toronto', ip_address: '203.0.113.17', port: 51820, public_key: '', status: 'online' },
      { region: 'Singapore 1', country: 'SG', city: 'Singapore', ip_address: '203.0.113.18', port: 51820, public_key: '', status: 'online' },
      { region: 'Tokyo 1', country: 'JP', city: 'Tokyo', ip_address: '203.0.113.19', port: 51820, public_key: '', status: 'online' },
      { region: 'Sydney 1', country: 'AU', city: 'Sydney', ip_address: '203.0.113.20', port: 51820, public_key: '', status: 'online' },
    ];
    await base44.entities.VPNServer.bulkCreate(samples);
    await loadServers();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(servers, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'voxvpn-servers.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const total = servers.length;
  const ready = servers.filter(s => (s.publicKey || '').trim()).length;
  const missing = total - ready;

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="text-white space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">VPN Servers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage VPN nodes, save WireGuard public keys, and validate config readiness.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setSelected(-1); setForm(EMPTY); setPreview('Fill form and click Preview.'); }}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-400 text-black">
            + Add Server
          </button>
          <button onClick={loadSample} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white">
            Load 10 Samples
          </button>
          <button onClick={() => runValidation()} className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
            Validate All
          </button>
          <button onClick={exportJSON} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white">
            Export JSON
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[['Total Servers', total, 'text-white'], ['With PublicKey', ready, 'text-emerald-400'], ['Missing PublicKey', missing, missing > 0 ? 'text-rose-400' : 'text-emerald-400']].map(([label, val, cls]) => (
          <div key={label} className="bg-[#0d1728] border border-white/5 rounded-2xl p-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-black mt-1 ${cls}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">

        {/* Server List */}
        <div className="bg-[#0d1728] border border-white/5 rounded-2xl p-4">
          <h3 className="font-bold text-white mb-3">Server List</h3>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {servers.length === 0 && <p className="text-slate-500 text-sm">No servers yet. Add one or load samples.</p>}
            {servers.map((s, i) => {
              const hasKey = (s.publicKey || '').trim().length > 0;
              return (
                <div key={i} onClick={() => selectServer(i)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${selected === i ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 bg-[#091523] hover:border-white/10'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-white">{s.name || 'Untitled'}</p>
                      <p className="text-slate-500 text-xs">{s.country} {s.city ? `• ${s.city}` : ''} • {s.host}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${hasKey ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {hasKey ? 'Key OK' : 'No Key'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Form */}
        <div className="bg-[#0d1728] border border-white/5 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white">Server Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['Server Name', 'name', 'e.g. New York 1'], ['Server ID', 'serverId', 'e.g. us-ny-1'], ['Country', 'country', 'e.g. US'], ['City', 'city', 'e.g. New York'], ['Public IP / Hostname', 'host', 'e.g. 203.0.113.10'], ['Port', 'port', '51820']].map(([label, key, ph]) => (
              <div key={key}>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">{label}</label>
                <input value={form[key]} onChange={f(key)} placeholder={ph}
                  className="w-full bg-[#091523] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cyan-500/50" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">WireGuard PublicKey</label>
            <textarea value={form.publicKey} onChange={f('publicKey')} placeholder="Paste server WireGuard public key here"
              className="w-full bg-[#091523] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cyan-500/50 min-h-[80px] resize-y" />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Peer API Token</label>
            <input value={form.apiToken} onChange={f('apiToken')} placeholder="voxvpn-secret-token (from server .env)"
              className="w-full bg-[#091523] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cyan-500/50" />
            <p className="text-slate-600 text-xs mt-1">Set on the Vultr server as <code>VOXVPN_API_TOKEN</code>. Used to call <code>/create-peer</code>.</p>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Status</label>
            <select value={form.status} onChange={f('status')}
              className="w-full bg-[#091523] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
              <option value="active">active</option>
              <option value="maintenance">maintenance</option>
              <option value="disabled">disabled</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Notes</label>
            <textarea value={form.notes} onChange={f('notes')} placeholder="Optional notes"
              className="w-full bg-[#091523] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cyan-500/50 min-h-[60px] resize-y" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={saveServer} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-400 text-black disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Server'}
            </button>
            <button onClick={() => setPreview(buildConf(form))}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white">
              Preview .conf
            </button>
            <button onClick={() => setValidation(buildSSH(form))}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white">
              SSH Command
            </button>
            <button onClick={deleteServer}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Validation + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#0d1728] border border-white/5 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3">Validation Results</h3>
          <pre className="bg-[#091523] border border-white/5 rounded-xl p-4 text-sm text-cyan-200 whitespace-pre-wrap break-words min-h-[160px] overflow-auto">{validation}</pre>
        </div>
        <div className="bg-[#0d1728] border border-white/5 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3">Config Preview</h3>
          <pre className="bg-[#091523] border border-white/5 rounded-xl p-4 text-sm text-cyan-200 whitespace-pre-wrap break-words min-h-[160px] overflow-auto">{preview}</pre>
        </div>
      </div>

      {/* Go-Live Checklist */}
      <div className="bg-[#0d1728] border border-white/5 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4">Go-Live Checklist</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-slate-500 font-semibold pb-2 pr-4">Check</th>
                <th className="text-left text-slate-500 font-semibold pb-2">Requirement</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                ['PublicKey saved', 'Every server record must contain the correct WireGuard public key.'],
                ['Endpoint correct', 'Host/IP and port must point to the correct Vultr node.'],
                ['Config generation', 'Generated client configs must include a non-empty PublicKey.'],
                ['Handshake test', 'Test one client per server location and confirm handshake works.'],
                ['Traffic test', 'Confirm internet works and public IP changes after connect.'],
                ['Branding', 'Keep WireGuard hidden in the customer-facing UI. Brand everything as VoxVPN.'],
              ].map(([check, req]) => (
                <tr key={check} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-semibold text-white whitespace-nowrap">{check}</td>
                  <td className="py-3 text-slate-400">{req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}