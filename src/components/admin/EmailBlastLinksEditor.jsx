import { Plus, X, Link as LinkIcon } from 'lucide-react';

export default function EmailBlastLinksEditor({ links, setLinks }) {
  const update = (i, field, value) => {
    const next = [...links];
    next[i] = { ...next[i], [field]: value };
    setLinks(next);
  };
  const remove = (i) => setLinks(links.filter((_, idx) => idx !== i));
  const add = () => setLinks([...links, { label: '', url: '' }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-slate-400 text-xs font-semibold flex items-center gap-1.5"><LinkIcon size={12} /> Links / Buttons</label>
        <button onClick={add} className="text-cyan-400 text-xs flex items-center gap-1 hover:text-cyan-300"><Plus size={12} /> Add Link</button>
      </div>
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={link.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            placeholder="Button label"
            className="flex-1 px-3 py-2 rounded-lg bg-[#0d1120] border border-white/10 text-white text-xs"
          />
          <input
            value={link.url}
            onChange={(e) => update(i, 'url', e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#0d1120] border border-white/10 text-white text-xs"
          />
          <button onClick={() => remove(i)} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}