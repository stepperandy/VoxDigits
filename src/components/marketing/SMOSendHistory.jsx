import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, CheckCircle, XCircle, Clock, Video, ChevronDown, ChevronUp, Filter } from "lucide-react";
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

const POST_STATUS_BADGE = {
  draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  posted: "bg-green-500/20 text-green-300 border-green-500/30",
  archived: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export default function SMOSendHistory() {
  const [logs, setLogs] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [logData, postData] = await Promise.all([
      base44.entities.SMOSendLog.list('-sent_at', 500).catch(() => []),
      base44.entities.SMOPost.list('-scheduled_date', 500).catch(() => []),
    ]);
    setLogs(logData || []);
    setAllPosts(postData || []);
    setLoading(false);
  };

  // Build a unified view: each post with its send outcomes merged in
  const unifiedPosts = useMemo(() => {
    // Index send logs by post_id
    const logsByPost = {};
    for (const log of logs) {
      const key = log.post_id || log.id;
      if (!logsByPost[key]) logsByPost[key] = [];
      logsByPost[key].push(log);
    }

    // Start with all posts (gives us full content + scheduled_date + status)
    const seen = new Set();
    const rows = [];

    for (const post of allPosts) {
      seen.add(post.id);
      const sendLogs = logsByPost[post.id] || [];
      const hasSend = sendLogs.length > 0;
      rows.push({
        id: post.id,
        content: post.content || "",
        scheduled_date: post.scheduled_date,
        platform: post.platform,
        post_status: post.status,
        campaign_name: post.campaign_name || "",
        post_type: post.post_type || "",
        // Use scheduled_date for sorting if no send occurred
        sort_date: hasSend ? sendLogs[0].sent_at : post.scheduled_date,
        has_send: hasSend,
        sent_at: hasSend ? sendLogs[0].sent_at : null,
        trigger_source: hasSend ? sendLogs[0].trigger_source : null,
        platforms: sendLogs.map(l => ({
          name: l.platform,
          status: l.status,
          video_used: l.video_used,
          error_message: l.error_message,
        })),
        overall_status: hasSend
          ? (sendLogs.every(l => l.status === "posted") ? "posted" : sendLogs.some(l => l.status === "posted") ? "partial" : "failed")
          : post.status,
      });
    }

    // Add send logs without a matching post record (e.g., deleted posts)
    for (const log of logs) {
      const key = log.post_id || log.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const matching = logs.filter(l => (l.post_id || l.id) === key);
      rows.push({
        id: key,
        content: log.post_content_snapshot || "",
        scheduled_date: null,
        platform: log.platform,
        post_status: "posted",
        campaign_name: log.campaign_name || "",
        post_type: "",
        sort_date: log.sent_at,
        has_send: true,
        sent_at: log.sent_at,
        trigger_source: log.trigger_source,
        platforms: matching.map(l => ({ name: l.platform, status: l.status, video_used: l.video_used, error_message: l.error_message })),
        overall_status: matching.every(l => l.status === "posted") ? "posted" : matching.some(l => l.status === "posted") ? "partial" : "failed",
      });
    }

    return rows.sort((a, b) => new Date(b.sort_date || 0) - new Date(a.sort_date || 0));
  }, [logs, allPosts]);

  const filtered = useMemo(() => {
    if (filter === "all") return unifiedPosts;
    if (filter === "posted") return unifiedPosts.filter(p => p.overall_status === "posted");
    if (filter === "scheduled") return unifiedPosts.filter(p => p.overall_status === "scheduled" || p.overall_status === "draft");
    if (filter === "failed") return unifiedPosts.filter(p => p.overall_status === "failed");
    return unifiedPosts;
  }, [unifiedPosts, filter]);

  const totalPosts = unifiedPosts.length;
  const postedCount = unifiedPosts.filter(p => p.overall_status === "posted").length;
  const scheduledCount = unifiedPosts.filter(p => p.overall_status === "scheduled" || p.overall_status === "draft").length;
  const failedCount = unifiedPosts.filter(p => p.overall_status === "failed").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-green-400" /> Post History
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400">{postedCount} posted</span>
            <span className="text-blue-400">{scheduledCount} scheduled</span>
            <span className="text-red-400">{failedCount} failed</span>
            <span className="text-gray-400">{totalPosts} total</span>
          </div>
          <Button onClick={loadAll} variant="ghost" size="sm" className="h-8 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 flex items-center gap-1"><Filter className="w-3 h-3" /> Filter:</span>
        {[
          { key: "all", label: "All" },
          { key: "posted", label: "Published" },
          { key: "scheduled", label: "Scheduled / Draft" },
          { key: "failed", label: "Failed" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-green-600 text-white"
                : "bg-slate-700/50 text-gray-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <Send className="w-10 h-10 text-green-400/50 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No posts match this filter.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.map((post) => {
              const isExpanded = expanded === post.id;
              const OverallIcon = post.overall_status === "posted" ? CheckCircle
                : post.overall_status === "failed" ? XCircle : Clock;
              const overallColor = post.overall_status === "posted" ? "text-green-400"
                : post.overall_status === "failed" ? "text-red-400"
                : post.overall_status === "partial" ? "text-amber-400" : "text-blue-400";

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  layout
                  className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors"
                >
                  {/* Row 1: Date + status + trigger badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm text-gray-300 font-medium">
                      {post.has_send ? formatDate(post.sent_at) : formatDateShort(post.scheduled_date)}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Overall status badge */}
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${POST_STATUS_BADGE[post.overall_status] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
                        <OverallIcon className={`w-3 h-3 ${overallColor}`} />
                        {post.overall_status === "partial" ? "partial" : post.overall_status}
                      </span>
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

                  {/* Content */}
                  <p className={`text-sm text-gray-300 mb-2 ${isExpanded ? "" : "line-clamp-2"}`}>
                    {post.content || <span className="text-gray-500 italic">No content</span>}
                  </p>

                  {/* Platform badges */}
                  {post.platforms.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${PLATFORM_COLORS[post.platform] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
                        {post.platform}
                      </span>
                      <span className="text-xs text-gray-500">Not yet sent</span>
                    </div>
                  )}

                  {/* Campaign */}
                  {(post.campaign_name || post.post_type) && (
                    <p className="text-xs text-gray-600 mt-2">
                      {post.campaign_name && <>Campaign: {post.campaign_name}</>}
                      {post.campaign_name && post.post_type && <> · </>}
                      {post.post_type && <span className="capitalize">{post.post_type}</span>}
                    </p>
                  )}

                  {/* Expand toggle */}
                  {post.content && post.content.length > 120 && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : post.id)}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-2"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? "Show less" : "Show full content"}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Info note */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          Shows all posts — published, scheduled, and failed. Automated entries appear when the <strong className="text-gray-400">Daily Auto-Poster</strong> (09:00 UTC) runs.
        </p>
      </div>
    </div>
  );
}