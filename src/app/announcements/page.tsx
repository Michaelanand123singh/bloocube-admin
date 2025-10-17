"use client";
import { useState, useEffect } from 'react';
import { Megaphone, Send, Users, Target, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
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
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetRoles: ['creator', 'brand'],
    priority: 'high',
    expiresAt: ''
  });

  const loadAnnouncements = async () => {
    try {
      setError(null);
      setLoading(true);
      // For now, we'll simulate loading announcements
      // In a real implementation, you'd fetch from the backend
      setAnnouncements([]);
    } catch (e: any) {
      setError(e.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
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
          expiresAt: ''
        });
        setShowCreate(false);
        await loadAnnouncements();
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
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Create Announcement
              </button>
            </div>
            <p className="text-slate-400 text-lg ml-13">Send important messages to creators and brands</p>
          </div>

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
