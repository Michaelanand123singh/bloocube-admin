"use client";
import { useEffect, useState } from 'react';
import { FileText, Search, Filter, RefreshCw, Play, Pause, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

interface Campaign {
  _id: string;
  title: string;
  name?: string;
  status: string;
  brand_id?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  description?: string;
  budget?: number;
  targetAudience?: string;
}

export default function PostsPage(){
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadCampaigns = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminApi.listCampaigns();
      setCampaigns(response.data.campaigns);
    } catch (e: any) {
      setError(e.message || 'Failed to load campaigns');
      console.error('Campaigns fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadCampaigns, 60000);
    return () => clearInterval(interval);
  }, []);

  const retryCampaign = async (id: string) => {
    try {
      // TODO: Implement retry endpoint in backend
      alert('Retry functionality will be implemented when backend endpoint is available.');
    } catch (e: any) {
      setError(e.message || 'Failed to retry campaign');
    }
  };

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brand_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
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
                onClick={loadCampaigns}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="active">Active</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="failed">Failed</option>
                <option value="paused">Paused</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-slate-400">
                <Filter className="w-4 h-4 mr-2" />
                {filteredCampaigns.length} of {campaigns.length} posts
              </div>
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
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {campaign.title || campaign.name || 'Untitled Post'}
                              </div>
                              {campaign.description && (
                                <div className="text-sm text-slate-400 truncate max-w-xs">
                                  {campaign.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-slate-300">
                            <User className="w-4 h-4 mr-2" />
                            {campaign.brand_id?.name || 'Unknown Brand'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1 capitalize">{campaign.status || 'Unknown'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => retryCampaign(campaign._id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30"
                          >
                            <Play className="w-4 h-4 inline mr-1" />
                            Retry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCampaigns.length === 0 && !loading && (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No posts found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  )
}


