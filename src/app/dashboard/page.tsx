"use client";
import { useEffect, useState } from 'react';
import { Users, Target, Gavel, BarChart3, TrendingUp, Activity, RefreshCw, Cpu, Server, LineChart } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

export default function DashboardPage(){
  const [stats, setStats] = useState<{users:number;campaigns:number;bids:number;analytics:number}|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [topPosts, setTopPosts] = useState<any[] | null>(null);
  const [platformStats, setPlatformStats] = useState<Record<string, any> | null>(null);
  const [aiStatus, setAiStatus] = useState<any | null>(null);
  const [period, setPeriod] = useState<'last_7_days'|'last_30_days'|'last_90_days'>('last_30_days');
  const [recentUsers, setRecentUsers] = useState<any[] | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<any[] | null>(null);
  const [systemLogs, setSystemLogs] = useState<any[] | null>(null);
  const [aiLogs, setAiLogs] = useState<any | null>(null);
  const [postsSeries, setPostsSeries] = useState<Array<{ label:string; value:number }>>([]);
  const [successBars, setSuccessBars] = useState<Array<{ label:string; success:number; failed:number }>>([]);

  const fetchStats = async () => {
    try {
      setError(null);

      const withRetry = async <T,>(fn: () => Promise<T>, attempts = 2): Promise<T> => {
        try { return await fn(); } catch (err: any) {
          const msg = String(err?.message || '');
          if (attempts > 1 && (msg.includes('Too many requests') || msg.includes('429'))) {
            await new Promise(r => setTimeout(r, 1000));
            return withRetry(fn, attempts - 1);
          }
          throw err;
        }
      };

      // Fetch critical stats first
      const statsRes = await withRetry(() => adminApi.getStats());
      setStats(statsRes.data);

      // Fetch the rest in parallel, but don't fail the whole page
      const results = await Promise.allSettled([
        withRetry(() => adminApi.getTopPosts(5, period)),
        withRetry(() => adminApi.getPlatformStats('youtube', period)),
        withRetry(() => adminApi.getPlatformStats('linkedin', period)),
        withRetry(() => adminApi.getPlatformStats('instagram', period)),
        withRetry(() => adminApi.getPlatformStats('facebook', period)),
        withRetry(() => adminApi.getPlatformStats('twitter', period)),
        withRetry(() => adminApi.getPostsTimeSeries(period)),
        withRetry(() => adminApi.getSuccessFailure(period)),
        withRetry(() => adminApi.getAIProvidersStatus()),
        withRetry(() => adminApi.listUsers()),
        withRetry(() => adminApi.listCampaigns()),
        withRetry(() => adminApi.getLogs(20)),
        withRetry(() => adminApi.getAIProviderLogs({ limit: 10 }))
      ]);

      const [topRes, ytRes, liRes, igRes, fbRes, twRes, tsRes, sfRes, aiRes, usersRes, campaignsRes, logsRes, aiLogsRes] = results;

      if (topRes.status === 'fulfilled') setTopPosts(topRes.value.data?.posts || []);
      if (ytRes.status === 'fulfilled' || liRes.status === 'fulfilled' || igRes.status === 'fulfilled' || fbRes.status === 'fulfilled' || twRes.status === 'fulfilled') {
        setPlatformStats({
          youtube: ytRes.status === 'fulfilled' ? (ytRes.value.data?.stats || {}) : (platformStats?.youtube || {}),
          linkedin: liRes.status === 'fulfilled' ? (liRes.value.data?.stats || {}) : (platformStats?.linkedin || {}),
          instagram: igRes.status === 'fulfilled' ? (igRes.value.data?.stats || {}) : (platformStats?.instagram || {}),
          facebook: fbRes.status === 'fulfilled' ? (fbRes.value.data?.stats || {}) : (platformStats?.facebook || {}),
          twitter: twRes.status === 'fulfilled' ? (twRes.value.data?.stats || {}) : (platformStats?.twitter || {})
        });
      }
      if (aiRes.status === 'fulfilled') setAiStatus(aiRes.value.data);
      if (tsRes.status === 'fulfilled') setPostsSeries(tsRes.value.data?.series || []);
      if (sfRes.status === 'fulfilled') setSuccessBars(sfRes.value.data?.bars || []);
      if (usersRes.status === 'fulfilled') setRecentUsers(usersRes.value.data?.users?.slice(0,5) || []);
      if (campaignsRes.status === 'fulfilled') setRecentCampaigns(campaignsRes.value.data?.campaigns?.slice(0,5) || []);
      if (logsRes.status === 'fulfilled') setSystemLogs(logsRes.value.data || []);
      if (aiLogsRes.status === 'fulfilled') setAiLogs(aiLogsRes.value.data || null);

      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message || 'Failed to fetch dashboard stats');
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [period]);

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-1">
                  <div className="flex items-center gap-1">
                    {([
                      { key: 'last_7_days', label: '7d' },
                      { key: 'last_30_days', label: '30d' },
                      { key: 'last_90_days', label: '90d' }
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setPeriod(opt.key)}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${period === opt.key ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <button
                  onClick={fetchStats}
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-lg ml-13">Monitor your platform metrics in real-time</p>
          </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 rounded-2xl p-6 h-40 animate-pulse" />
            ))}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={stats.users}
              icon={<Users className="w-6 h-6" />}
              gradient="from-blue-500 to-cyan-500"
              delay={0}
            />
            <StatCard 
              title="Active Campaigns" 
              value={stats.campaigns}
              icon={<Target className="w-6 h-6" />}
              gradient="from-violet-500 to-purple-500"
              delay={100}
            />
            <StatCard 
              title="Total Bids" 
              value={stats.bids}
              icon={<Gavel className="w-6 h-6" />}
              gradient="from-amber-500 to-orange-500"
              delay={200}
            />
            <StatCard 
              title="Analytics Events" 
              value={stats.analytics}
              icon={<BarChart3 className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-500"
              delay={300}
            />
          </div>
        )}

        {/* Additional Info */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="Avg. Campaign Size"
              value={stats.campaigns ? Math.round(stats.bids / stats.campaigns) : 0}
              suffix=" bids"
            />
            <MetricCard 
              label="User Engagement"
              value={stats.users ? Math.round((stats.analytics / stats.users) * 10) / 10 : 0}
              suffix=" events/user"
            />
            <MetricCard 
              label="Platform Activity"
              value={stats.analytics > 0 ? 'High' : 'Low'}
              trend={stats.analytics > 0 ? '+12.5%' : undefined}
            />
          </div>
        )}

        {/* Charts and Tables - Removed Top Performing and AI Providers sections as requested */}

        {/* Platform Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Simple inline bar charts using CSS widths */}
          {platformStats && (
            <>
              {platformStats.youtube && <PlatformStatsCard platform="YouTube" icon={<Server className="w-4 h-4 text-red-400" />} stats={platformStats.youtube} />}
              {platformStats.linkedin && <PlatformStatsCard platform="LinkedIn" icon={<Server className="w-4 h-4 text-blue-400" />} stats={platformStats.linkedin} />}
              {platformStats.instagram && <PlatformStatsCard platform="Instagram" icon={<Server className="w-4 h-4 text-pink-400" />} stats={platformStats.instagram} />}
              {platformStats.facebook && <PlatformStatsCard platform="Facebook" icon={<Server className="w-4 h-4 text-indigo-400" />} stats={platformStats.facebook} />}
              {platformStats.twitter && <PlatformStatsCard platform="Twitter" icon={<Server className="w-4 h-4 text-sky-400" />} stats={platformStats.twitter} />}
            </>
          )}
        </div>

        {/* Overview Metrics inspired by image */}
        <div className="mt-10">
          <div className="text-xl font-semibold text-slate-200 mb-4">Overview Metrics</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <OverviewCard title="Total Users" value={stats?.users || 0} sub="since last month" />
            <OverviewCard title="Active Users" value={(recentUsers || []).filter(u => u?.isActive !== false).length} sub="since last week" />
            <OverviewCard title="Total Posts" value={(topPosts || []).length + (platformStats?.youtube?.totalPosts || 0)} sub="since last month" />
            <OverviewCard title="Success Rate" value={computeSuccessRate(aiLogs)} sub="vs last month" percent />
          </div>
        </div>

        {/* Post Activity & Performance */}
        <div className="mt-8">
          <div className="text-xl font-semibold text-slate-200 mb-4">Post Activity & Performance</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleLineChart title="Posts Over Time" series={postsSeries} />
            <SimpleBarChart title="Post Success vs. Failure" bars={successBars} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="text-slate-200 font-semibold mb-3">Quick Actions</div>
          <div className="flex flex-wrap gap-3">
            <a href="/users" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-slate-200 hover:border-slate-700/60">
              <Users className="w-4 h-4" /> Manage Users
            </a>
            <a href="/campaigns" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-slate-200 hover:border-slate-700/60">
              <Gavel className="w-4 h-4" /> Manage Posts
            </a>
          </div>
        </div>

        {/* Recent Users and Campaigns */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-200 font-semibold">Recent Users</div>
              <a href="/users" className="text-xs text-slate-400 hover:text-white">View all</a>
            </div>
            {!recentUsers && <div className="text-slate-500 text-sm">No data</div>}
            {recentUsers && (
              <ul className="divide-y divide-slate-800/60">
                {recentUsers.map((u: any) => (
                  <li key={u._id} className="py-2 flex items-center justify-between">
                    <div className="text-slate-300">{u.name || u.email}</div>
                    <div className="text-xs text-slate-500">{u.role}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-200 font-semibold">Recent Campaigns</div>
              <a href="/campaigns" className="text-xs text-slate-400 hover:text-white">View all</a>
            </div>
            {!recentCampaigns && <div className="text-slate-500 text-sm">No data</div>}
            {recentCampaigns && (
              <ul className="divide-y divide-slate-800/60">
                {recentCampaigns.map((c: any) => (
                  <li key={c._id} className="py-2">
                    <div className="text-slate-300">{c.title || c.name || 'Untitled Campaign'}</div>
                    <div className="text-xs text-slate-500">{c.status || '—'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-200 font-semibold">System Logs</div>
              <a href="/logs" className="text-xs text-slate-400 hover:text-white">View all</a>
            </div>
            {!systemLogs && <div className="text-slate-500 text-sm">No data</div>}
            {systemLogs && (
              <div className="max-h-64 overflow-auto text-xs">
                {systemLogs.map((l: any, idx: number) => (
                  <div key={idx} className="py-1 border-b border-slate-800/40">
                    <span className="text-slate-500">[{new Date(l.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className={`${l.level === 'error' ? 'text-red-400' : 'text-slate-300'}`}>{l.level?.toUpperCase() || 'INFO'}</span>{' '}
                    <span className="text-slate-300">{l.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-200 font-semibold">AI Provider Logs</div>
              <a href="/logs" className="text-xs text-slate-400 hover:text-white">View all</a>
            </div>
            {!aiLogs && <div className="text-slate-500 text-sm">No data</div>}
            {aiLogs && (
              <div className="max-h-64 overflow-auto text-xs">
                {(aiLogs.logs || aiLogs.data?.logs || []).map((l: any, idx: number) => (
                  <div key={idx} className="py-1 border-b border-slate-800/40">
                    <span className="text-slate-500">[{new Date(l.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className="text-slate-400">{l.provider}</span>{' '}
                    <span className="text-slate-300">{l.operation}</span>{' '}
                    <span className="text-slate-500">{l.model}</span>{' '}
                    <span className="text-slate-400">{l.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
    </Layout>
  )
}

function StatCard({title, value, icon, gradient, delay}:{
  title:string;
  value:number;
  icon:React.ReactNode;
  gradient:string;
  delay:number;
}){
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{transitionDelay: `${delay}ms`}}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
      
      {/* Icon Badge */}
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
          {title}
          <TrendingUp className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-4xl font-bold text-white mb-1 tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-3">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
            style={{width: isVisible ? '100%' : '0%'}}
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({label, value, suffix, trend}:{
  label:string;
  value:string|number;
  suffix?:string;
  trend?:string;
}){
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 hover:border-slate-700/50 transition-all">
      <div className="text-slate-500 text-sm mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-200">
          {value}{suffix}
        </div>
        {trend && (
          <span className="text-emerald-400 text-sm font-medium">{trend}</span>
        )}
      </div>
    </div>
  )
}

function PlatformStatsCard({ platform, icon, stats }:{ platform:string; icon:React.ReactNode; stats:any }){
  const bars: Array<{ label: string; value: number; color: string }> = [
    { label: 'Views', value: Number(stats?.totalViews || stats?.views || 0), color: 'bg-emerald-500' },
    { label: 'Likes', value: Number(stats?.totalLikes || stats?.likes || 0), color: 'bg-violet-500' },
    { label: 'Comments', value: Number(stats?.totalComments || stats?.comments || 0), color: 'bg-cyan-500' },
    { label: 'Shares', value: Number(stats?.totalShares || stats?.shares || 0), color: 'bg-amber-500' },
  ];
  const max = Math.max(1, ...bars.map(b => b.value));
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-slate-200 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{platform} Stats</h3>
      </div>
      <div className="space-y-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{b.label}</span>
              <span>{b.value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${b.color}`} style={{ width: `${Math.round((b.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewCard({ title, value, sub, percent }:{ title:string; value:number; sub?:string; percent?:boolean }){
  return (
    <div className="bg-white/5 border border-slate-800/60 rounded-2xl p-4">
      <div className="text-slate-400 text-xs mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-100">{percent ? `${value}%` : value.toLocaleString()}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

function SimpleLineChart({ title, series }:{ title:string; series: Array<{ label:string; value:number }> }){
  const max = Math.max(1, ...series.map(s => s.value));
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
      <div className="text-slate-200 font-semibold mb-4">{title}</div>
      <div className="space-y-4">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-10 text-xs text-slate-500">{s.label}</div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${Math.round((s.value / max) * 100)}%` }} />
            </div>
            <div className="w-12 text-right text-xs text-slate-400">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleBarChart({ title, bars }:{ title:string; bars: Array<{ label:string; success:number; failed:number }> }){
  const max = Math.max(1, ...bars.map(b => b.success + b.failed));
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
      <div className="text-slate-200 font-semibold mb-4">{title}</div>
      <div className="space-y-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{b.label}</span>
              <span>{b.success + b.failed}</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-md overflow-hidden flex">
              <div className="bg-emerald-500" style={{ width: `${Math.round((b.success / max) * 100)}%` }} />
              <div className="bg-red-500" style={{ width: `${Math.round((b.failed / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function computeSuccessRate(aiLogs: any): number {
  const list = (aiLogs?.logs || aiLogs?.data?.logs || []) as any[];
  if (!list.length) return 0;
  const success = list.filter(l => l.status === 'success').length;
  return Math.round((success / list.length) * 1000) / 10;
}

function buildPostsTimeSeries(aiLogs: any): Array<{ label:string; value:number }> {
  const list = (aiLogs?.logs || aiLogs?.data?.logs || []) as any[];
  const byMonth = new Map<string, number>();
  for (const l of list) {
    const d = new Date(l.timestamp);
    const key = d.toLocaleString(undefined, { month: 'short' });
    byMonth.set(key, (byMonth.get(key) || 0) + 1);
  }
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map(m => ({ label: m, value: byMonth.get(m) || 0 })).slice(0, 6);
}

function buildSuccessFailure(aiLogs: any): Array<{ label:string; success:number; failed:number }> {
  const list = (aiLogs?.logs || aiLogs?.data?.logs || []) as any[];
  const byMonth = new Map<string, { s:number; f:number }>();
  for (const l of list) {
    const d = new Date(l.timestamp);
    const key = d.toLocaleString(undefined, { month: 'short' });
    const prev = byMonth.get(key) || { s: 0, f: 0 };
    if (l.status === 'success') prev.s += 1; else prev.f += 1;
    byMonth.set(key, prev);
  }
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map(m => {
    const v = byMonth.get(m) || { s: 0, f: 0 };
    return { label: m, success: v.s, failed: v.f };
  }).slice(0, 6);
}