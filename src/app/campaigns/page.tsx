"use client";
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { adminApi } from '@/lib/api';

export default function CampaignsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [campaigns, setCampaigns] = useState<any[]>([]);

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
                  <tr key={c._id} className="border-t border-slate-800 hover:bg-slate-900/40">
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
    </Layout>
  );
}
