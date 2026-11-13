import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function VpnServers() {
  const [servers, setServers] = useState([]);
  const [search, setSearch] = useState('');
  const [protocol, setProtocol] = useState('openvpn');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await base44.functions.invoke('vpnResellers', { action: 'servers' });
      if (data.error) throw new Error(data.error);
      setServers(data.servers || []);
    } catch (e) { setError(e.response?.data?.error || e.message || 'Unable to load servers.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const download = async (server) => {
    setBusy(server.id); setError(''); setNotice('');
    try {
      const { data } = await base44.functions.invoke('vpnResellers', { action: 'config', serverId: server.id, protocol });
      if (data.error || !data.content) throw new Error(data.error || 'No profile returned.');
      const url = URL.createObjectURL(new Blob([data.content], { type: 'text/plain' }));
      const a = document.createElement('a'); a.href = url; a.download = data.filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`Profile downloaded for ${server.name}. Import it into ${protocol === 'openvpn' ? 'OpenVPN Connect and enter your assigned VPN username and password' : 'WireGuard'}, then activate the tunnel there. Downloading does not connect your device.`);
    } catch (e) { setError(e.response?.data?.error || e.message || 'Unable to download profile.'); }
    finally { setBusy(null); }
  };
  return <main className="min-h-screen bg-[#060d1a] text-white px-6 py-16">
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">VoxVPN servers</h1>
      <p className="text-slate-300">Download your profile and connect using a VPN application. This page cannot verify or disconnect an external VPN tunnel.</p>
      <div className="flex flex-wrap gap-3">
        <input aria-label="Search servers" className="bg-slate-800 rounded-lg p-3 flex-1" placeholder="Search locations" value={search} onChange={e => setSearch(e.target.value)} />
        <select aria-label="VPN protocol" className="bg-slate-800 rounded-lg p-3" value={protocol} disabled={busy !== null} onChange={e => setProtocol(e.target.value)}>
          <option value="openvpn">OpenVPN</option><option value="wireguard">WireGuard</option>
        </select>
        <button className="p-3 border rounded-lg" disabled={loading || busy !== null} onClick={load}>Refresh</button>
      </div>
      {error && <p role="alert" className="p-4 bg-red-950 rounded-lg">{error}</p>}
      {notice && <p role="status" className="p-4 bg-cyan-950 rounded-lg">{notice}</p>}
      {loading ? <p>Loading available servers…</p> : <ul className="space-y-3">
        {servers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => <li key={s.id} className="flex justify-between items-center gap-4 p-4 bg-slate-900 rounded-xl">
          <span>{s.name}</span><button disabled={busy !== null} className="bg-cyan-400 text-black px-4 py-2 rounded-lg disabled:opacity-50" onClick={() => download(s)}>{busy === s.id ? 'Preparing…' : 'Download profile'}</button>
        </li>)}
        {!servers.length && <li>No servers are available. Check provider setup or retry.</li>}
      </ul>}
    </div>
  </main>;
}
