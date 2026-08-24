import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, BarChart3, TrendingUp, ThumbsUp, CheckCircle, XCircle, Calendar, Layers } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const PLATFORM_LABELS = {
  Facebook: "Facebook",
  Instagram: "Instagram",
  LinkedIn: "LinkedIn",
  Twitter: "Twitter",
  TikTok: "TikTok",
};

const PLATFORM_COLORS_HEX = {
  Facebook: "#1877f2",
  Instagram: "#e1306c",
  LinkedIn: "#0a66c2",
  Twitter: "#1da1f2",
  TikTok: "#ff0050",
};

const STATUS_COLORS_HEX = {
  draft: "#6b7280",
  scheduled: "#3b82f6",
  posted: "#22c55e",
  archived: "#9ca3af",
};

const POST_TYPE_LABELS = {
  promotional: "Promotional",
  educational: "Educational",
  engagement: "Engagement",
  announcement: "Announcement",
  testimonial: "Testimonial",
};

function formatShortDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SMOPerformanceReport() {
  const [posts, setPosts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, l] = await Promise.all([
      base44.entities.SMOPost.list("-scheduled_date", 500).catch(() => []),
      base44.entities.SMOSendLog.list("-sent_at", 500).catch(() => []),
    ]);
    setPosts(p || []);
    setLogs(l || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Platform breakdown: posts created per platform + send success rate
  const platformStats = useMemo(() => {
    const stats = {};
    for (const platform of Object.keys(PLATFORM_LABELS)) {
      stats[platform] = { platform, posts: 0, sent: 0, posted: 0, failed: 0, skipped: 0 };
    }
    for (const post of posts) {
      const p = post.platform;
      if (stats[p]) stats[p].posts += 1;
    }
    for (const log of logs) {
      const p = log.platform;
      if (!stats[p]) continue;
      stats[p].sent += 1;
      if (log.status === "posted") stats[p].posted += 1;
      else if (log.status === "failed") stats[p].failed += 1;
      else if (log.status === "skipped") stats[p].skipped += 1;
    }
    return Object.values(stats).map(s => ({
      ...s,
      success_rate: s.sent > 0 ? Math.round((s.posted / s.sent) * 100) : 0,
    }));
  }, [posts, logs]);

  // Post status distribution
  const statusDistribution = useMemo(() => {
    const counts = {};
    for (const post of posts) {
      const s = post.status || "draft";
      counts[s] = (counts[s] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [posts]);

  // Post type distribution
  const typeDistribution = useMemo(() => {
    const counts = {};
    for (const post of posts) {
      const t = post.post_type || "promotional";
      counts[t] = (counts[t] || 0) + 1;
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: POST_TYPE_LABELS[key] || key,
      value,
    }));
  }, [posts]);

  // Sends over time (last 14 days)
  const sendsByDay = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = formatShortDate(d);
      days[key] = { date: key, posted: 0, failed: 0 };
    }
    for (const log of logs) {
      if (!log.sent_at) continue;
      const key = formatShortDate(log.sent_at);
      if (days[key]) {
        if (log.status === "posted") days[key].posted += 1;
        else if (log.status === "failed") days[key].failed += 1;
      }
    }
    return Object.values(days);
  }, [logs]);

  // Top content by send volume (which posts were published to the most platforms)
  const topContent = useMemo(() => {
    const byPost = {};
    for (const log of logs) {
      const key = log.post_id || log.id;
      if (!byPost[key]) {
        byPost[key] = {
          id: key,
          content: log.post_content_snapshot || "",
          platforms_hit: 0,
          campaign: log.campaign_name || "",
        };
      }
      if (log.status === "posted") byPost[key].platforms_hit += 1;
    }
    return Object.values(byPost)
      .sort((a, b) => b.platforms_hit - a.platforms_hit)
      .slice(0, 5);
  }, [logs]);

  const totals = {
    posts: posts.length,
    sent: logs.length,
    posted: logs.filter(l => l.status === "posted").length,
    failed: logs.filter(l => l.status === "failed").length,
    successRate: logs.length > 0 ? Math.round((logs.filter(l => l.status === "posted").length / logs.length) * 100) : 0,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Performance Report
        </h3>
        <Button onClick={load} variant="ghost" size="sm" className="h-8 text-xs">
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SummaryCard icon={Layers} label="Total Posts" value={totals.posts} color="text-purple-400" bg="bg-purple-500/10" />
            <SummaryCard icon={CheckCircle} label="Published" value={totals.posted} color="text-green-400" bg="bg-green-500/10" />
            <SummaryCard icon={XCircle} label="Failed" value={totals.failed} color="text-red-400" bg="bg-red-500/10" />
            <SummaryCard icon={TrendingUp} label="Success Rate" value={`${totals.successRate}%`} color="text-cyan-400" bg="bg-cyan-500/10" />
            <SummaryCard icon={Calendar} label="Send Attempts" value={totals.sent} color="text-amber-400" bg="bg-amber-500/10" />
          </div>

          {/* Platform breakdown table */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-indigo-400" /> Platform Performance
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-slate-700">
                    <th className="text-left py-2 px-2 font-medium">Platform</th>
                    <th className="text-right py-2 px-2 font-medium">Posts</th>
                    <th className="text-right py-2 px-2 font-medium">Sent</th>
                    <th className="text-right py-2 px-2 font-medium">Posted</th>
                    <th className="text-right py-2 px-2 font-medium">Failed</th>
                    <th className="text-right py-2 px-2 font-medium">Success %</th>
                  </tr>
                </thead>
                <tbody>
                  {platformStats.map(s => (
                    <tr key={s.platform} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-2 px-2">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: PLATFORM_COLORS_HEX[s.platform] }} />
                          <span className="text-white font-medium">{s.platform}</span>
                        </span>
                      </td>
                      <td className="text-right py-2 px-2 text-gray-300">{s.posts}</td>
                      <td className="text-right py-2 px-2 text-gray-300">{s.sent}</td>
                      <td className="text-right py-2 px-2 text-green-400">{s.posted}</td>
                      <td className="text-right py-2 px-2 text-red-400">{s.failed}</td>
                      <td className="text-right py-2 px-2">
                        <span className={`font-semibold ${s.success_rate >= 80 ? "text-green-400" : s.success_rate >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {s.success_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sends over time */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Sends Over Time (14 days)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={sendsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="posted" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Posts per platform bar chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Posts Created Per Platform</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="platform" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Bar dataKey="posts" radius={[4, 4, 0, 0]}>
                    {platformStats.map((entry, idx) => (
                      <Cell key={idx} fill={PLATFORM_COLORS_HEX[entry.platform] || "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Post status pie */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Post Status Distribution</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`} labelLine={false}
                    style={{ fontSize: 11, fill: "#e2e8f0" }}>
                    {statusDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={STATUS_COLORS_HEX[entry.name] || "#6366f1"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Post type distribution */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Content Type Mix</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top performing content */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-400" /> Top Performing Content (by platforms reached)
            </h4>
            {topContent.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No published content yet.</p>
            ) : (
              <div className="space-y-2">
                {topContent.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 bg-slate-700/40 rounded-lg p-3"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 line-clamp-2">{post.content}</p>
                      {post.campaign && <p className="text-xs text-gray-500 mt-1">Campaign: {post.campaign}</p>}
                    </div>
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs font-semibold flex-shrink-0">
                      <CheckCircle className="w-3 h-3" /> {post.platforms_hit} platforms
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`rounded-lg border border-slate-700 p-3 ${bg}`}>
      <Icon className={`w-4 h-4 mb-1 ${color}`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}