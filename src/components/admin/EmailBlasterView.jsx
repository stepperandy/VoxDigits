import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Image as ImageIcon, Video, Link as LinkIcon, Send, Loader2, Users, Mail, RefreshCw } from 'lucide-react';
import EmailBlastLinksEditor from './EmailBlastLinksEditor';
import EmailBlastHistory from './EmailBlastHistory';
import EmailPreviewPanel from './EmailPreviewPanel';

export default function EmailBlasterView() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [recipientMode, setRecipientMode] = useState('all_users');
  const [customEmailsText, setCustomEmailsText] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [blasts, setBlasts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = () => {
    setHistoryLoading(true);
    base44.entities.EmailBlast.list({ sort: '-created_date', limit: 20 })
      .then((page) => setBlasts(page.items || []))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => { loadHistory(); }, []);

  const generateWithAI = async () => {
    setGenLoading(true);
    try {
      const [textRes, imageRes] = await Promise.all([
        base44.integrations.Core.InvokeLLM({
          prompt: `Write a short, compelling marketing email for a VPN/security product about: ${topic || subject || 'a new promotion'}. Keep it concise and persuasive.`,
          response_json_schema: { type: 'object', properties: { subject: { type: 'string' }, body: { type: 'string' } }, required: ['subject', 'body'] },
        }),
        base44.integrations.Core.GenerateImage({ prompt: topic || subject || 'VPN security promotional banner' }),
      ]);
      setSubject(textRes.subject);
      setBody(textRes.body);
      setImageUrl(imageRes.url);
    } finally {
      setGenLoading(false);
    }
  };

  const uploadFile = async (file, kind) => {
    if (kind === 'image') setUploadingImage(true); else setUploadingVideo(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (kind === 'image') setImageUrl(res.file_url); else setVideoUrl(res.file_url);
    } finally {
      if (kind === 'image') setUploadingImage(false); else setUploadingVideo(false);
    }
  };

  const addLink = () => setLinks([...links, { label: '', url: '' }]);

  const send = async () => {
    setSending(true);
    setResult(null);
    try {
      const custom_emails = customEmailsText.split(/[\n,]/).map((e) => e.trim()).filter(Boolean);
      const res = await base44.functions.invoke('sendEmailBlast', {
        subject, body, image_url: imageUrl, video_url: videoUrl, links,
        recipient_mode: recipientMode, custom_emails, ai_generated: true,
      });
      setResult(res.data);
      loadHistory();
    } finally {
      setSending(false);
    }
  };

  const canSend = subject && body && !sending && (recipientMode === 'all_users' || customEmailsText.trim());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2"><Mail size={22} className="text-cyan-400" /> Email Blaster</h2>
          <p className="text-slate-400 text-sm mt-1">Compose once with AI, attach media & links, and broadcast to all registered users.</p>
        </div>
        <button onClick={loadHistory} className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-white/20 text-sm transition-all">
          <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Composer + Live preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Composer */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 space-y-4">
          <div>
            <label className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full mt-1.5 px-4 py-2.5 rounded-lg bg-[#060910] border border-white/10 text-white text-sm font-semibold"
            />
          </div>

          <div>
            <label className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement — add links, images, and video links..."
              rows={7}
              className="w-full mt-1.5 px-4 py-2.5 rounded-lg bg-[#060910] border border-white/10 text-white text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold cursor-pointer">
              {uploadingImage ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />} Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], 'image')} />
            </label>
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold cursor-pointer">
              {uploadingVideo ? <Loader2 size={13} className="animate-spin" /> : <Video size={13} />} Attach Video / File
              <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], 'video')} />
            </label>
            <button onClick={addLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <LinkIcon size={13} /> Insert Link
            </button>
          </div>

          {imageUrl && <img src={imageUrl} alt="preview" className="max-h-40 rounded-lg border border-white/10" />}
          {videoUrl && <video src={videoUrl} controls className="max-h-40 rounded-lg border border-white/10" />}

          <EmailBlastLinksEditor links={links} setLinks={setLinks} />

          <div className="pt-3 border-t border-white/5 space-y-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic / prompt (e.g. '50% off summer VPN sale')"
              className="w-full px-4 py-2.5 rounded-lg bg-[#060910] border border-white/10 text-white text-sm"
            />
            <button onClick={generateWithAI} disabled={genLoading} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold disabled:opacity-50">
              {genLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Generate marketing material with AI
            </button>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="radio" checked={recipientMode === 'all_users'} onChange={() => setRecipientMode('all_users')} /> All app users
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="radio" checked={recipientMode === 'custom_emails'} onChange={() => setRecipientMode('custom_emails')} /> Custom email list
              </label>
            </div>
            {recipientMode === 'custom_emails' && (
              <textarea
                value={customEmailsText}
                onChange={(e) => setCustomEmailsText(e.target.value)}
                placeholder="Paste emails, one per line or comma-separated (max 500)"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-[#060910] border border-white/10 text-white text-sm"
              />
            )}
          </div>

          <button
            onClick={send}
            disabled={!canSend}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm disabled:opacity-40"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending ? 'Sending...' : 'Send Blast (up to 500 recipients)'}
          </button>

          {result && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Users size={14} /> Sent {result.sent}/{result.total} {result.failed > 0 ? `· ${result.failed} failed` : ''}
            </div>
          )}
        </div>

        {/* Live preview */}
        <EmailPreviewPanel subject={subject} body={body} imageUrl={imageUrl} videoUrl={videoUrl} links={links} />
      </div>

      <div>
        <h3 className="text-white font-bold text-sm mb-3">Recent Blasts</h3>
        <EmailBlastHistory blasts={blasts} loading={historyLoading} />
      </div>
    </div>
  );
}