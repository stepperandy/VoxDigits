import { Mail } from 'lucide-react';

export default function EmailPreviewPanel({ subject, body, imageUrl, videoUrl, links, senderName = 'VoxVPN' }) {
  const hasContent = subject || body || imageUrl || videoUrl;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 h-full">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Email preview</p>
      <p className="text-slate-600 text-xs mt-0.5 mb-4">How the message will arrive in users' inboxes</p>

      <div className="rounded-xl bg-[#060910] border border-white/5 p-4">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Mail size={14} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">{senderName}</p>
            <p className="text-slate-500 text-[11px]">{subject || 'No subject yet'}</p>
          </div>
        </div>

        {hasContent ? (
          <div className="space-y-3">
            {body ? (
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{body}</p>
            ) : (
              <p className="text-slate-600 text-sm italic">Start writing your message to see the preview...</p>
            )}
            {imageUrl && <img src={imageUrl} alt="preview" className="w-full rounded-lg border border-white/10" />}
            {videoUrl && <video src={videoUrl} controls className="w-full rounded-lg border border-white/10" />}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {links.filter((l) => l.label || l.url).map((l, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold">{l.label || l.url}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-600 text-sm italic">Start writing your message to see the preview...</p>
        )}
      </div>
    </div>
  );
}