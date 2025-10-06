"use client";
import { useEffect, useState } from 'react';
import { FileText, Search, Filter, RefreshCw, Pause, AlertCircle, CheckCircle, Clock, User, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

interface PostItem {
  _id: string;
  title?: string;
  content?: any;
  platform: 'twitter'|'youtube'|'instagram'|'linkedin'|'facebook';
  post_type: string;
  status: string;
  author?: { name?: string; email?: string; role?: string };
  createdAt: string;
  publishedAt?: string;
  platform_url?: string;
}

export default function PostsPage(){
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState<{ page:number; limit:number; total:number; pages:number }|null>(null);
  const [selected, setSelected] = useState<PostItem | null>(null);
  const [selectedFull, setSelectedFull] = useState<any | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const loadPosts = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminApi.listPosts({ page, limit, status: filterStatus || undefined, platform: filterPlatform || undefined, search: searchTerm || undefined });
      setPosts(response.posts || []);
      setPagination(response.pagination || null);
    } catch (e: any) {
      setError(e.message || 'Failed to load posts');
      console.error('Posts fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page, limit, filterStatus, filterPlatform]);

  const platformBadge = (p: string) => {
    const colors: any = { twitter: 'bg-sky-500/20 text-sky-300', youtube: 'bg-red-500/20 text-red-300', instagram: 'bg-pink-500/20 text-pink-300', linkedin: 'bg-blue-500/20 text-blue-300', facebook: 'bg-indigo-500/20 text-indigo-300' };
    return <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${colors[p] || 'bg-slate-500/20 text-slate-300'}`}><Globe className="w-3 h-3 mr-1" />{p}</span>;
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesPlatform = !filterPlatform || p.platform === filterPlatform as any;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'pending':
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'pending':
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'failed':
      case 'error':
        return 'bg-red-500/20 text-red-300';
      case 'paused':
        return 'bg-slate-500/20 text-slate-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };
  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Post Management
                </h1>
              </div>
              <button
                onClick={() => loadPosts()}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all disabled:opacity-50"
                title="Refresh posts"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-slate-400 text-lg ml-13">Monitor and manage all posts and campaigns</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="failed">Failed</option>
              </select>

              {/* Platform Filter */}
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="">All Platforms</option>
                <option value="twitter">Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-slate-400">
                <Filter className="w-4 h-4 mr-2" />
                {filteredPosts.length} of {pagination?.total ?? filteredPosts.length} posts
              </div>

              {/* Page Size */}
              <select
                value={limit}
                onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading posts...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Post</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredPosts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={async () => {
                        setSelected(p);
                        setSelectedFull(null);
                        try {
                          setSelectedLoading(true);
                          const res = await adminApi.getPost(p._id);
                          setSelectedFull((res as any).post || (res as any).data?.post || null);
                        } catch (_) {
                          // ignore
                        } finally {
                          setSelectedLoading(false);
                        }
                      }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {p.title || 'Untitled Post'}
                              </div>
                              <div className="mt-1">{platformBadge(p.platform)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-slate-300">
                            <User className="w-4 h-4 mr-2" />
                            {p.author?.name || p.author?.email || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>
                            {getStatusIcon(p.status)}
                            <span className="ml-1 capitalize">{p.status || 'Unknown'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          {p.platform_url && <a className="text-violet-300 hover:underline" href={p.platform_url} target="_blank" rel="noreferrer">Open</a>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredPosts.length === 0 && !loading && (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No posts found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <div>Page {pagination?.page || page} of {pagination?.pages || 1} — {pagination?.total || filteredPosts.length} total</div>
            <div className="flex items-center gap-2">
              <button disabled={(pagination?.page || page) <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={(pagination?.page || page) >= (pagination?.pages || 1)} onClick={() => setPage((p) => (p + 1))} className="px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </main>
      {/* Post Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-4xl mx-4 text-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selected.title || 'Untitled Post'}</h2>
                <div className="text-slate-400 text-sm flex items-center gap-2">
                  {platformBadge(selected.platform)}
                  <span>•</span>
                  <span>{new Date(selected.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">×</button>
            </div>

            {/* Author */}
            <div className="mb-4 text-sm text-slate-300">
              Author: <span className="text-white font-medium">{selected.author?.name || selected.author?.email || 'Unknown'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Status</div>
                <div>{getStatusIcon(selected.status)} <span className="ml-1 capitalize">{selected.status}</span></div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Published</div>
                <div className="text-slate-100 font-semibold">{selected.publishedAt ? new Date(selected.publishedAt).toLocaleString() : '—'}</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-2">Platform URL</div>
                {selected.platform_url ? (
                  <a href={selected.platform_url} target="_blank" rel="noreferrer" className="text-violet-300 hover:underline break-all">{selected.platform_url}</a>
                ) : (
                  <div className="text-slate-500">—</div>
                )}
              </div>
            </div>

            {/* Media thumbnails */}
            <div className="mb-4">
              <div className="text-slate-400 text-xs mb-2">Media</div>
              <div className="flex flex-wrap gap-3">
                {(selectedFull?.media || []).slice(0,8).map((m:any, idx:number) => (
                  <a key={idx} href={m.url} target="_blank" rel="noreferrer" className="block w-24 h-24 bg-slate-800 rounded-lg overflow-hidden border border-slate-700/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.thumbnail || m.url} alt={m.filename || 'media'} className="w-full h-full object-cover" />
                  </a>
                ))}
                {(!selectedFull?.media || selectedFull.media.length === 0) && (
                  <div className="text-slate-500 text-sm">No media</div>
                )}
              </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {['views','likes','comments','shares','clicks'].map((k) => (
                <div key={k} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
                  <div className="text-slate-400 text-xs mb-1 uppercase">{k}</div>
                  <div className="text-lg font-semibold">{selectedFull?.analytics?.[k] ?? 0}</div>
                </div>
              ))}
            </div>

            {selectedLoading && <div className="mt-3 text-slate-400 text-sm">Loading details...</div>}

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}


