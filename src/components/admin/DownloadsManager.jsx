import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, Plus, Loader2 } from 'lucide-react';

export default function DownloadsManager() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: 'Windows',
    version: '1.0.0',
    file_url: '',
    price: 0,
    is_free: true,
    is_active: true,
  });

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Download.list();
      setDownloads(data || []);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Download.create(formData);
      setFormData({
        name: '',
        description: '',
        platform: 'Windows',
        version: '1.0.0',
        file_url: '',
        price: 0,
        is_free: true,
        is_active: true,
      });
      setShowForm(false);
      loadDownloads();
    } catch (error) {
      console.error('Error creating download:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this download?')) return;
    try {
      await base44.entities.Download.delete(id);
      loadDownloads();
    } catch (error) {
      console.error('Error deleting download:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Download Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg"
        >
          <Plus size={18} /> Add Download
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0d1120] border border-white/5 rounded-lg p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-white/10 rounded text-white placeholder-slate-500"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-white/10 rounded text-white placeholder-slate-500"
            />
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-white/10 rounded text-white"
            >
              <option>Windows</option>
              <option>macOS</option>
              <option>Linux</option>
              <option>iOS</option>
              <option>Android</option>
              <option>Router</option>
            </select>
            <input
              type="text"
              placeholder="Version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-white/10 rounded text-white placeholder-slate-500"
            />
            <input
              type="text"
              placeholder="File URL"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-white/10 rounded text-white placeholder-slate-500"
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                />
                Free
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded">
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-white/20 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-cyan-400" size={24} />
        </div>
      ) : (
        <div className="grid gap-4">
          {downloads.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No downloads yet</p>
          ) : (
            downloads.map((download) => (
              <div key={download.id} className="bg-[#0d1120] border border-white/5 rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{download.name}</h3>
                  <p className="text-slate-400 text-sm">{download.platform} • v{download.version}</p>
                  <p className="text-slate-500 text-xs mt-1">{download.description}</p>
                  <div className="flex gap-2 mt-2">
                    {download.is_free && <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">Free</span>}
                    {download.is_active && <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded">Active</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(download.id)}
                  className="p-2 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}