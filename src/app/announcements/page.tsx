"use client";
import { useState, useEffect } from 'react';
import { Megaphone, Send, Users, Target, AlertCircle, Clock, CheckCircle, X, Mail, MailCheck, MailX, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  targetRoles: string[];
  priority: string;
  createdAt: string;
  notificationsCreated: number;
  emailsQueued?: number;
  emailsSent?: number;
  emailsFailed?: number;
}

interface EmailStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
  recent: {
    last24Hours: number;
    lastHour: number;
  };
  isProcessing: boolean;
  batchSize: number;
}

interface ComprehensiveStats {
  announcements: {
    total: number;
    unread: number;
    priorityBreakdown: Record<string, { total: number; unread: number }>;
  };
  emails: EmailStats;
  summary: {
    totalAnnouncements: number;
    totalEmailsQueued: number;
    emailsSent: number;
    emailsFailed: number;
    emailsPending: number;
    successRate: string;
  };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetRoles: ['creator', 'brand'],
    priority: 'high',
    expiresAt: '',
    sendEmail: true
  });

  const loadAnnouncements = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminApi.getAnnouncements({ page: 1, limit: 50 });
      if (response.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminApi.getComprehensiveStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (e: any) {
      console.error('Failed to load stats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const createAnnouncement = async () => {
    try {
      setError(null);
      setCreating(true);
      
      const response = await adminApi.createAnnouncement(newAnnouncement);
      
      if (response.success) {
        setNewAnnouncement({
          title: '',
          message: '',
          targetRoles: ['creator', 'brand'],
          priority: 'high',
          expiresAt: '',
          sendEmail: true
        });
        setShowCreate(false);
        await loadAnnouncements();
        await loadStats(); // Refresh stats after creating announcement
      }
    } catch (e: any) {
      setError(e.message || 'Failed to create announcement');
    } finally {
      setCreating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getTargetRoleColor = (role: string) => {
    switch (role) {
      case 'creator':
        return 'bg-blue-500/20 text-blue-300';
      case 'brand':
        return 'bg-purple-500/20 text-purple-300';
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
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Announcements
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadStats}
                  disabled={statsLoading}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                  Refresh Stats
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Create Announcement
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-lg ml-13">Send important messages to creators and brands</p>
          </div>

          {/* Statistics Dashboard */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Announcements */}
              <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Announcements</p>
                    <p className="text-2xl font-bold text-white">{stats.summary.totalAnnouncements}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Emails Sent */}
              <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Emails Sent</p>
                    <p className="text-2xl font-bold text-green-400">{stats.summary.emailsSent}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <MailCheck className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Emails Failed */}
              <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Emails Failed</p>
                    <p className="text-2xl font-bold text-red-400">{stats.summary.emailsFailed}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <MailX className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.summary.successRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Queue Status */}
          {stats && (
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Email Queue Status
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  stats.emails.isProcessing 
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {stats.emails.isProcessing ? 'Processing' : 'Idle'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.emails.pending}</p>
                  <p className="text-sm text-slate-400">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.emails.processing}</p>
                  <p className="text-sm text-slate-400">Processing</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.emails.completed}</p>
                  <p className="text-sm text-slate-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{stats.emails.failed}</p>
                  <p className="text-sm text-slate-400">Failed</p>
                </div>
              </div>

              {stats.emails.retrying > 0 && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {stats.emails.retrying} emails are being retried
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Announcements List */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center">
                <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No announcements yet</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white"
                >
                  Create your first announcement
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="p-6 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-3">{announcement.message}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Sent to {announcement.notificationsCreated} users</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <div className="flex gap-1">
                              {announcement.targetRoles.map((role) => (
                                <span key={role} className={`px-2 py-1 rounded text-xs ${getTargetRoleColor(role)}`}>
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Announcement Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !creating && setShowCreate(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Create Announcement</h2>
              </div>
              <button 
                onClick={() => !creating && setShowCreate(false)} 
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter announcement title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50"
                  maxLength={200}
                />
                <div className="text-xs text-slate-500 mt-1">{newAnnouncement.title.length}/200</div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  placeholder="Enter announcement message"
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 h-32 resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-slate-500 mt-1">{newAnnouncement.message.length}/1000</div>
              </div>

              {/* Target Roles */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  {['creator', 'brand'].map((role) => (
                    <label key={role} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAnnouncement.targetRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAnnouncement({
                              ...newAnnouncement,
                              targetRoles: [...newAnnouncement.targetRoles, role]
                            });
                          } else {
                            setNewAnnouncement({
                              ...newAnnouncement,
                              targetRoles: newAnnouncement.targetRoles.filter(r => r !== role)
                            });
                          }
                        }}
                        className="w-4 h-4 text-orange-600 bg-slate-800 border-slate-700 rounded focus:ring-orange-500"
                      />
                      <span className="text-slate-300 capitalize">{role}s</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Email Toggle */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.sendEmail}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sendEmail: e.target.checked })}
                    className="w-4 h-4 text-orange-600 bg-slate-800 border-slate-700 rounded focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-slate-300">Send email notifications</span>
                    <p className="text-xs text-slate-500">Users will receive both in-app notifications and emails</p>
                  </div>
                </label>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expiration Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={newAnnouncement.expiresAt}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                />
                <div className="text-xs text-slate-500 mt-1">Leave empty for no expiration</div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreate(false)}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createAnnouncement}
                  disabled={creating || !newAnnouncement.title || !newAnnouncement.message || newAnnouncement.targetRoles.length === 0}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50 flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Announcement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
