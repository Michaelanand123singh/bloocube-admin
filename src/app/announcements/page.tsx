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
  const [progress, setProgress] = useState(0);
const [processingHistory, setProcessingHistory] = useState<string[]>([]);
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
    setProgress(0);

    // Close modal immediately
    setShowCreate(false);

    // Add initial log
    setProcessingHistory(prev => [
      ...prev,
      `Announcement "${newAnnouncement.title}" is being processed... ⏳`
    ]);

    // Progress simulation
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 10;
      if (simulatedProgress > 90) simulatedProgress = 90; // max until API done
      setProgress(simulatedProgress);
    }, 100);

    // API call
    const response = await adminApi.createAnnouncement(newAnnouncement);

    if (response.success) {
      setProcessingHistory(prev => [
        ...prev,
        `Announcement "${newAnnouncement.title}" queued for sending ✅`
      ]);
      setProgress(100);

      // Refresh announcements & stats
      await loadAnnouncements();
      await loadStats();
    } else {
      throw new Error('Failed to create announcement');
    }

    clearInterval(interval);

    // Auto-hide card after short delay
    setTimeout(() => {
      setProcessingHistory([]);
      setProgress(0);
    }, 1000);

    // Reset form
    setNewAnnouncement({
      title: '',
      message: '',
      targetRoles: ['creator', 'brand'],
      priority: 'high',
      expiresAt: '',
      sendEmail: true
    });

  } catch (e: any) {
    setError(e.message || 'Failed to create announcement');
    setProcessingHistory(prev => [
      ...prev,
      `Error creating "${newAnnouncement.title}" ❌`
    ]);
    setProgress(0);
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
    <main className="min-h-screen  p-4 md:p-10">
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Announcements
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="px-3 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 rounded-md text-white flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 rounded-md text-white flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            Create Announcement
          </button>
        </div>
      </div>
      <p className="text-slate-400 text-base sm:text-lg ml-0 sm:ml-13">Send important messages to creators and brands</p>
    </div>

    {/* Statistics Dashboard */}
    {stats && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { title: 'Total Announcements', value: stats.summary.totalAnnouncements, icon: <Megaphone className="w-6 h-6 text-blue-400" />, bg: 'bg-blue-500/20' },
          { title: 'Emails Sent', value: stats.summary.emailsSent, icon: <MailCheck className="w-6 h-6 text-green-400" />, bg: 'bg-green-500/20' },
          { title: 'Emails Failed', value: stats.summary.emailsFailed, icon: <MailX className="w-6 h-6 text-red-400" />, bg: 'bg-red-500/20' },
          { title: 'Success Rate', value: stats.summary.successRate + '%', icon: <TrendingUp className="w-6 h-6 text-orange-400" />, bg: 'bg-orange-500/20' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-sm p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm sm:text-base">{stat.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Email Queue Status */}
    {stats && (
      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-sm p-4 md:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 text-center">
          {[
            { label: 'Pending', value: stats.emails.pending, color: 'text-white' },
            { label: 'Processing', value: stats.emails.processing, color: 'text-blue-400' },
            { label: 'Completed', value: stats.emails.completed, color: 'text-green-400' },
            { label: 'Failed', value: stats.emails.failed, color: 'text-red-400' },
          ].map((item, idx) => (
            <div key={idx}>
              <p className={`text-2xl sm:text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>

        {stats.emails.retrying > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
            <p className="text-yellow-300 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {stats.emails.retrying} emails are being retried
            </p>
          </div>
        )}
      </div>
    )}

    {/* Error State */}
    {error && (
      <div className="bg-red-950/50 border border-red-500/50 rounded-sm p-4 mb-6 backdrop-blur-sm">
        <p className="text-red-300 text-sm sm:text-base">{error}</p>
      </div>
    )}

    {/* Announcements List */}
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-sm overflow-hidden">
      {loading ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm sm:text-base">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-6 sm:p-8 text-center">
          <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4 text-sm sm:text-base">No announcements yet</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 rounded-md text-white text-sm sm:text-base"
          >
            Create your first announcement
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="p-4 sm:p-6 hover:bg-slate-800/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{announcement.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-3 text-sm sm:text-base">{announcement.message}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Sent to {announcement.notificationsCreated} users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <div className="flex gap-1 flex-wrap">
                        {announcement.targetRoles.map((role) => (
                          <span key={role} className={`px-2 py-1 rounded text-xs sm:text-sm ${getTargetRoleColor(role)}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">{new Date(announcement.createdAt).toLocaleString()}</span>
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
              <div className="flex flex-col lg:flex-row items-center justify-end gap-3 pt-4">
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
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
      {/* Processing History & Progress Card */}
{creating || processingHistory.length > 0 ? (
  <div className="fixed bottom-6 right-4 sm:right-16 left-4 sm:left-auto w-auto sm:w-80 mx-auto sm:mx-0 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-lg z-50">
    <h4 className="text-sm font-semibold text-white mb-2 text-center sm:text-left">Processing History</h4>

    {/* Progress Bar */}
    {creating && (
      <div className="w-full bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className="bg-orange-500 h-2 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}

    {/* History Logs */}
    <div className="max-h-40 overflow-y-auto space-y-1">
      {processingHistory.map((log, index) => (
        <p key={index} className="text-xs text-slate-300">{log}</p>
      ))}
    </div>
  </div>
) : null}


    </Layout>
  );
}
