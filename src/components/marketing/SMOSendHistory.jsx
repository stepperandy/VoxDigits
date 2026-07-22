import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, CheckCircle, XCircle, Clock, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORM_COLORS = {
  Facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  LinkedIn: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Twitter: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  TikTok: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_ICON = {
  posted: CheckCircle,
  failed: XCircle,
  skipped: Clock,
};

const STATUS_COLOR = {
  posted: "text-green-400",
  failed: "text-red-400",
  skipped: "text-gray-400",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

export default function SMOSendHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await base44.entities.SMOSendLog.list('-sent_at', 200).catch(() => []);
    setLogs(data || []);
    setLoading(false);
  };

  // Group logs by post_id — one entry per post, showing all platforms it was sent to
  const groupedPosts = React.useMemo(() => {
    const groups = {};
    for (const log of logs) {
      const key = log.post_id || log.id;
      if (!groups[key]) {
        groups[key] = {
          post_id: key,
          content: log.post_content_snapshot || "",
          campaign_name: log.campaign_name || "",
          sent_at: log.sent_at,
          platforms: [],
          trigger_source: log.trigger_source,
          sent_by: log.sent_by,
        };
      }
      // Track earliest sent_at for the group
      if (log.sent_at && (!groups[key].sent_at || new Date(log.sent_at) < new Date(groups[key].sent_at))) {
        groups[key].sent_at = log.sent_at;
      }
      groups[key].platforms.push({
        name: log.platform,
        status: log.status,
        video_used: log.video_used,
        platform_response: log.platform_response,
        error_message: log.error_message,
      });
    }
    return Object.values(groups).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  }, [logs]);

  const totalPosts = groupedPosts.length;
  const totalSends = logs.length;
  const autoCount = logs.filter(l => l.trigger_source === 'bulk' || l.trigger_source === 'automation').length;
  const manualCount = logs.filter(l => l.trigger_source === 'manual').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-green-400" /> Post History
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{totalPosts} posts · {totalSends} sends</span>
          <span className="text-cyan-400">{autoCount} auto</span>
          <span className="text-purple-400">{manualCount} manual</span>
          <Button onClick={loadLogs} variant="ghost" size="sm" className="h-8 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : groupedPosts.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <Send className="w-10 h-10 text-green-400/50 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No posts published yet.</p>
          <p className="text-gray-500 text-sm">Published posts will appear here automatically — both manual and automated.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {groupedPosts.map((post) => (
              <motion.div
                key={post.post_id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors"
              >
                {/* Date + trigger badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm text-gray-300 font-medium">
                    {formatDate(post.sent_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    {(post.trigger_source === 'bulk' || post.trigger_source === 'automation') && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Auto
                      </span>
                    )}
                    {post.trigger_source === 'manual' && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Manual
                      </span>
                    )}
                  </div>
                </div>

                {/* Content snippet */}
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                  {post.content}
                </p>

                {/* Target platforms */}
                <div className="flex flex-wrap items-center gap-2">
                  {post.platforms.map((p, idx) => {
                    const StatusIcon = STATUS_ICON[p.status] || Clock;
                    return (
                      <span
                        key={idx}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${PLATFORM_COLORS[p.name] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}
                      >
                        {p.name}
                        <StatusIcon className={`w-3 h-3 ${STATUS_COLOR[p.status]}`} />
                        {p.video_used && <Video className="w-2.5 h-2.5 text-orange-400" />}
                      </span>
                    );
                  })}
                </div>

                {/* Campaign */}
                {post.campaign_name && (
                  <p className="text-xs text-gray-600 mt-2">Campaign: {post.campaign_name}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info note about automation */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          Automated posts appear here when the <strong className="text-gray-400">Daily Auto-Poster</strong> (09:00 UTC) publishes scheduled posts.
          New posts are generated weekly by the <strong className="text-gray-400">SMO Post Generator</strong> (Mondays 08:00).
        </p>
      </div>
    </div>
  );
}