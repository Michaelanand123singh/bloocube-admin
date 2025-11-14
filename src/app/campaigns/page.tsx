"use client";
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { adminApi } from '@/lib/api';

export default function CampaignsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selected, setSelected] = useState<any|null>(null);
  const [details, setDetails] = useState<{analytics:any; posts:any[]; bids:any[]; pagination?: any} | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState<string>('');

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

   // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
   const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCampaigns = campaigns.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2 py-6 text-slate-100">
        <h1 className="text-3xl font-semibold mb-4">Campaigns</h1>
        {loading && <div className="text-sm text-slate-400">Loading...</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {currentCampaigns.map((c: any) => (
    <div
      key={c._id}
      onClick={async () => {
        setSelected(c);
        setDetails(null);
        try {
          setDetailsLoading(true);
          const res = await adminApi.getCampaignAnalytics(c._id);
          setDetails({ analytics: res.data.analytics, posts: res.data.posts || [], bids: [] });

          // fire and forget: load bids
          setBidsLoading(true);
          setBidsError('');
          adminApi
            .getCampaignBids(c._id, { limit: 50, sort: '-createdAt' })
            .then((bres) =>
              setDetails((d) =>
                d
                  ? {
                      ...d,
                      bids: bres.data.bids || [],
                      pagination: bres.data.pagination,
                    }
                  : d
              )
            )
            .catch((e: any) =>
              setBidsError(e?.message || 'Failed to load bids')
            )
            .finally(() => setBidsLoading(false));
        } catch (e) {
          // keep modal open even if analytics fails
        } finally {
          setDetailsLoading(false);
        }
      }}
      className="bg-slate-900/70 border border-slate-800 rounded-sm p-5 cursor-pointer hover:bg-slate-800/70 hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-slate-100 truncate">
          {c.name || c.title || 'Untitled'}
        </h3>
        <span
          className={`px-2 py-1 text-xs rounded font-medium ${
            c.status === 'active'
              ? 'bg-green-700/20 text-green-400'
              : c.status === 'paused'
              ? 'bg-yellow-700/20 text-yellow-300'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {c.status || 'unknown'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        <div className="flex justify-between">
          <span className="text-slate-500">Budget:</span>
          <span className="text-slate-200 font-medium">
            {c.budget ? `$${c.budget.toLocaleString('en-IN')}` : '-'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Created:</span>
          <span>
            {c.createdAt
              ? new Date(c.createdAt).toLocaleString()
              : '-'}
          </span>
        </div>
      </div>
    </div>
  ))}

  {currentCampaigns.length === 0 && (
    <div className="col-span-full text-center py-10 text-slate-400 border border-slate-800 rounded-2xl">
      No campaigns found
    </div>
            )}
            

            {/* Pagination Controls */}
            <div className="w-full flex justify-center items-center">
  {totalPages > 1 && (
    <div className="flex flex-wrap justify-center items-center mt-8 gap-4 text-center">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-slate-400 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )}
</div>

</div>

        )}
      </div>
      {/* Campaign Details Modal */}
     
      









      {selected && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
    {/* background */}
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => setSelected(null)}
    />

    {/* modal box */}
    <div className="relative bg-slate-900 border border-slate-800 rounded-sm  p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">
            {selected.name || selected.title || "Untitled Campaign"}
          </h2>
          <div className="text-slate-400 text-xs sm:text-sm">
            Status:{" "}
            <span className="text-slate-200">
              {selected.status || "unknown"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSelected(null)}
          className="text-slate-400 hover:text-white text-xl leading-none self-end sm:self-start"
        >
          ×
        </button>
      </div>

      {/* TOP 3 INFO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {[
          {
            label: "Budget",
            value: selected.budget ? `$${selected.budget.toLocaleString('en-IN')}` : "—",
          },
          {
            label: "Created",
            value: selected.createdAt
              ? new Date(selected.createdAt).toLocaleString()
              : "—",
          },
          {
            label: "Brand",
            value:
              selected.brand_id?.name ||
              selected.brand?.name ||
              "—",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-slate-800/40 border border-slate-700 rounded-xl p-4"
          >
            <div className="text-slate-400 text-xs mb-1">{item.label}</div>
            <div className="text-base sm:text-lg font-semibold">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ANALYTICS + REQUIREMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Budget</div>
                <div className="text-lg font-semibold">
                  {selected.budget ? `₹${selected.budget.toLocaleString('en-IN')}` : '—'}
                </div>
              </div>

              <div>
                <div className="text-slate-400">Views</div>
                <div className="font-semibold">{details.analytics?.totalViews ?? 0}</div>
              </div>

              <div>
                <div className="text-slate-400">Likes</div>
                <div className="font-semibold">{details.analytics?.totalLikes ?? 0}</div>
              </div>

              <div>
                <div className="text-slate-400">Comments</div>
                <div className="font-semibold">{details.analytics?.totalComments ?? 0}</div>
              </div>

              <div className="col-span-2">
                <div className="text-slate-400">Avg. Engagement</div>
                <div className="font-semibold">
                  {details.analytics?.avgEngagementRate?.toFixed
                    ? details.analytics.avgEngagementRate.toFixed(2)
                    : details.analytics?.avgEngagementRate || 0}
                  %
                </div>
              </div>
            </div>
          )}
        </div>

        {/* requirements */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-2">Requirements</div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">
            {selected.requirements?.description || "—"}
          </div>
        </div>
      </div>

      {/* BIDS SECTION */}
      <div className="mt-4 bg-slate-800/40 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="text-slate-400 text-xs">Bids & Interest</div>
          {details?.pagination && (
            <div className="text-[11px] text-slate-500">
              {details.pagination.total} total
            </div>
          )}
        </div>

        {bidsLoading && (
          <div className="text-sm text-slate-400">Loading bids…</div>
        )}

        {bidsError && (
          <div className="text-sm text-red-400">{bidsError}</div>
        )}

        {!bidsLoading && details && (
          <div className="overflow-auto max-h-64">
            <table className="w-full min-w-[550px] text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 pr-3">Creator</th>
                  <th className="text-left py-2 pr-3">Bid</th>
                  <th className="text-left py-2 pr-3">Deliverables</th>
                  <th className="text-left py-2 pr-3">Status</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {(details.bids || []).map((b) => (
                  <tr key={b._id} className="border-b border-slate-800">
                    <td className="py-2 pr-3">
                      <div className="text-slate-200">
                        {b.creator_id?.name || b.creator?.name || "—"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.creator_id?.email}
                      </div>
                    </td>

                    <td className="py-2 pr-3">
                      <div className="text-slate-200">
                        {b.currency || "INR"}{" "}
                        {b.bid_amount?.toLocaleString?.() || b.bid_amount}
                      </div>
                      <div
                        className="text-[11px] text-slate-500 truncate max-w-[200px]"
                        title={b.proposal_text}
                      >
                        {b.proposal_text}
                      </div>
                    </td>

                    <td className="py-2 pr-3">
                      <div className="text-[11px] text-slate-400">
                        Posts: {b.deliverables?.posts || 0} • Stories:{" "}
                        {b.deliverables?.stories || 0} • Reels:{" "}
                        {b.deliverables?.reels || 0} • Videos:{" "}
                        {b.deliverables?.videos || 0}
                      </div>
                      {b.deliverables?.timeline && (
                        <div className="text-[11px] text-slate-500">
                          Timeline: {b.deliverables.timeline}
                        </div>
                      )}
                    </td>

                    <td className="py-2 pr-3">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">
                        {b.status}
                      </span>
                    </td>

                    <td className="py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          disabled={b.status !== "pending"}
                          onClick={async () => {
                            try {
                              await adminApi.acceptBid(selected._id, b._id);
                              const br = await adminApi.getCampaignBids(
                                selected._id,
                                { limit: 50, sort: "-createdAt" }
                              );
                              setDetails((d) =>
                                d
                                  ? {
                                      ...d,
                                      bids: br.data.bids || [],
                                      pagination: br.data.pagination,
                                    }
                                  : d
                              );
                            } catch (e:any) {
                              setBidsError(
                                e?.message || "Failed to accept bid"
                              );
                            }
                          }}
                          className="px-2 py-1 rounded border border-emerald-600 text-emerald-400 hover:bg-emerald-900/20 disabled:opacity-50"
                        >
                          Accept
                        </button>

                        <button
                          disabled={b.status !== "pending"}
                          onClick={async () => {
                            try {
                              await adminApi.rejectBid(selected._id, b._id);
                              const br = await adminApi.getCampaignBids(
                                selected._id,
                                { limit: 50, sort: "-createdAt" }
                              );
                              setDetails((d) =>
                                d
                                  ? {
                                      ...d,
                                      bids: br.data.bids || [],
                                      pagination: br.data.pagination,
                                    }
                                  : d
                              );
                            } catch (e:any) {
                              setBidsError(
                                e?.message || "Failed to reject bid"
                              );
                            }
                          }}
                          className="px-2 py-1 rounded border border-red-600 text-red-400 hover:bg-red-900/20 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {(details.bids || []).length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-slate-500 text-sm text-center"
                    >
                      No bids yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT POSTS */}
      <div className="mt-4">
        <div className="text-slate-400 text-xs mb-2">Recent Posts</div>

        <div className="max-h-48 overflow-auto text-sm">
          {!detailsLoading &&
            details &&
            (details.posts || [])
              .slice(0, 10)
              .map((p:any, i:number) => (
                <div
                  key={i}
                  className="py-2 border-b border-slate-800 flex items-center justify-between"
                >
                  <div className="text-slate-300">
                    {p.title || p.post_title || "Post"}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {new Date(
                      p.createdAt || p.timestamp || Date.now()
                    ).toLocaleString()}
                  </div>
                </div>
              ))}

          {detailsLoading && (
            <div className="text-slate-400">Loading...</div>
          )}
        </div>
      </div>

      {/* CLOSE BUTTON */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setSelected(null)}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </Layout>
  );
}
