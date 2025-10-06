"use client";
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { adminApi } from '@/lib/api';

export default function CampaignsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selected, setSelected] = useState<any|null>(null);
  const [details, setDetails] = useState<{analytics:any; posts:any[]} | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await adminApi.listCampaigns();
        setCampaigns(res.data?.campaigns || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
        <h1 className="text-2xl font-semibold mb-4">Campaigns</h1>
        {loading && <div className="text-sm text-slate-400">Loading...</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-sm text-slate-300">Name</th>
                  <th className="px-4 py-3 text-sm text-slate-300">Status</th>
                  <th className="px-4 py-3 text-sm text-slate-300">Budget</th>
                  <th className="px-4 py-3 text-sm text-slate-300">Created</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any) => (
                  <tr key={c._id} className="border-t border-slate-800 hover:bg-slate-900/40 cursor-pointer" onClick={async () => {
                    setSelected(c);
                    setDetails(null);
                    try {
                      setDetailsLoading(true);
                      const res = await adminApi.getCampaignAnalytics(c._id);
                      setDetails({ analytics: res.data.analytics, posts: res.data.posts || [] });
                    } catch (e) {
                      // keep modal open even if analytics fails
                    } finally {
                      setDetailsLoading(false);
                    }
                  }}>
                    <td className="px-4 py-3 text-sm">{c.name || c.title || 'Untitled'}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">{c.status || 'unknown'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{c.budget ? `$${c.budget}` : '-'}</td>
                    <td className="px-4 py-3 text-sm">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-sm text-slate-400">No campaigns found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Campaign Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-4xl mx-4 text-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selected.name || selected.title || 'Untitled Campaign'}</h2>
                <div className="text-slate-400 text-sm">Status: <span className="text-slate-200">{selected.status || 'unknown'}</span></div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Budget</div>
                <div className="text-lg font-semibold">{selected.budget ? `$${selected.budget}` : '—'}</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Created</div>
                <div className="text-lg font-semibold">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Brand</div>
                <div className="text-lg font-semibold">{selected.brand_id?.name || selected.brand?.name || '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-3">Analytics</div>
                {detailsLoading && <div className="text-sm text-slate-400">Loading analytics...</div>}
                {!detailsLoading && details && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-400">Total Posts</div>
                      <div className="text-slate-100 font-semibold">{details.analytics?.totalPosts ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Views</div>
                      <div className="text-slate-100 font-semibold">{details.analytics?.totalViews ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Likes</div>
                      <div className="text-slate-100 font-semibold">{details.analytics?.totalLikes ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Comments</div>
                      <div className="text-slate-100 font-semibold">{details.analytics?.totalComments ?? 0}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-slate-400">Avg. Engagement</div>
                      <div className="text-slate-100 font-semibold">{details.analytics?.avgEngagementRate?.toFixed ? details.analytics.avgEngagementRate.toFixed(2) : details.analytics?.avgEngagementRate || 0}%</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-3">Requirements</div>
                <div className="text-sm text-slate-300 whitespace-pre-wrap">{selected.requirements?.description || '—'}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-slate-400 text-xs mb-2">Recent Posts</div>
              <div className="max-h-48 overflow-auto text-sm">
                {!detailsLoading && details && (details.posts || []).slice(0,10).map((p:any, idx:number) => (
                  <div key={idx} className="py-2 border-b border-slate-800/60 flex items-center justify-between">
                    <div className="text-slate-300">{p.title || p.post_title || 'Post'}</div>
                    <div className="text-slate-500">{new Date(p.createdAt || p.timestamp || Date.now()).toLocaleString()}</div>
                  </div>
                ))}
                {detailsLoading && <div className="text-slate-400">Loading...</div>}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
