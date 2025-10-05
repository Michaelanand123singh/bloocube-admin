"use client";
import { useState, useEffect } from 'react';
import { Settings, Save, Key, Mail, Database, Shield, AlertCircle, CheckCircle, RefreshCw, Plus, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

interface SystemSettings {
  apiKeys: {
    twitter?: string;
    linkedin?: string;
    google?: string;
  };
  email: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    from?: string;
  };
  database: {
    connectionString?: string;
    maxConnections?: number;
  };
  security: {
    jwtSecret?: string;
    sessionTimeout?: number;
  };
}

export default function SettingsPage(){
  const [settings, setSettings] = useState<SystemSettings>({
    apiKeys: {},
    email: {},
    database: {},
    security: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState('api');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: 'creator' | 'brand' | 'admin' }>({ name: '', email: '', password: '', role: 'creator' });

  const loadSettings = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminApi.getSettings();
      const data = response.data || {};
      setSettings({
        apiKeys: data.apiKeys || {},
        email: data.email || {},
        database: data.database || {},
        security: data.security || {}
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load settings');
      console.error('Settings fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const submitCreateUser = async () => {
    try {
      setError(null);
      setCreatingUser(true);
      await adminApi.createUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'creator' });
      setShowCreateUser(false);
      setSuccess('User created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const saveSettings = async () => {
    try {
      setError(null);
      setSaving(true);
      await adminApi.saveSettings(settings);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  System Settings
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create User
                </button>
                <button
                  onClick={loadSettings}
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all disabled:opacity-50"
                  title="Refresh settings"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-lg ml-13">Manage system configuration and API keys</p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 mb-6 backdrop-blur-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-2xl p-4 mb-6 backdrop-blur-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-300">{success}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading settings...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* API Keys Tab */}
                {activeTab === 'api' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Twitter API Key</label>
                        <input
                          type="password"
                          value={settings.apiKeys.twitter || ''}
                          onChange={(e) => updateSetting('apiKeys', 'twitter', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="Enter Twitter API key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn API Key</label>
                        <input
                          type="password"
                          value={settings.apiKeys.linkedin || ''}
                          onChange={(e) => updateSetting('apiKeys', 'linkedin', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="Enter LinkedIn API key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Google API Key</label>
                        <input
                          type="password"
                          value={settings.apiKeys.google || ''}
                          onChange={(e) => updateSetting('apiKeys', 'google', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="Enter Google API key"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Tab */}
                {activeTab === 'email' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Email Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Host</label>
                        <input
                          type="text"
                          value={settings.email.host || ''}
                          onChange={(e) => updateSetting('email', 'host', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Port</label>
                        <input
                          type="number"
                          value={settings.email.port || ''}
                          onChange={(e) => updateSetting('email', 'port', parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email User</label>
                        <input
                          type="text"
                          value={settings.email.user || ''}
                          onChange={(e) => updateSetting('email', 'user', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="admin@bloocube.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">From Email</label>
                        <input
                          type="email"
                          value={settings.email.from || ''}
                          onChange={(e) => updateSetting('email', 'from', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="noreply@bloocube.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Password</label>
                        <input
                          type="password"
                          value={settings.email.password || ''}
                          onChange={(e) => updateSetting('email', 'password', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="Enter email password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Database Tab */}
                {activeTab === 'database' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Database Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Connection String</label>
                        <input
                          type="password"
                          value={settings.database.connectionString || ''}
                          onChange={(e) => updateSetting('database', 'connectionString', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="mongodb://localhost:27017/bloocube"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Max Connections</label>
                        <input
                          type="number"
                          value={settings.database.maxConnections || ''}
                          onChange={(e) => updateSetting('database', 'maxConnections', parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">JWT Secret</label>
                        <input
                          type="password"
                          value={settings.security.jwtSecret || ''}
                          onChange={(e) => updateSetting('security', 'jwtSecret', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="Enter JWT secret"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout (seconds)</label>
                        <input
                          type="number"
                          value={settings.security.sessionTimeout || ''}
                          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                          placeholder="3600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !creatingUser && setShowCreateUser(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Create New User</h2>
              <button onClick={() => !creatingUser && setShowCreateUser(false)} className="p-2 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="creator">Creator</option>
                <option value="brand">Brand</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={() => setShowCreateUser(false)} disabled={creatingUser} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</button>
                <button onClick={submitCreateUser} disabled={creatingUser || !newUser.name || !newUser.email || !newUser.password} className="px-4 py-2 rounded-lg bg-violet-600 text-white disabled:opacity-50">
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
