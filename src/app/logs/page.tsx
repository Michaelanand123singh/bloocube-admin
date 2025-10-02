"use client";
import { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, Info, XCircle, CheckCircle, Filter, Search, Download } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service?: string;
  userId?: string;
  action?: string;
  error?: string;
  metadata?: any;
}

export default function LogsPage(){
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterService, setFilterService] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLogs = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminApi.getLogs();
      // Transform the response to match our interface
      const logEntries: LogEntry[] = Array.isArray(response.data) 
        ? response.data 
        : response.data.logs || [];
      setLogs(logEntries);
    } catch (e: any) {
      setError(e.message || 'Failed to load logs');
      console.error('Logs fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Auto-refresh every 10 seconds if enabled
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadLogs();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || log.level === filterLevel;
    const matchesService = !filterService || log.service === filterService;
    
    return matchesSearch && matchesLevel && matchesService;
  });

  const getLogIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warn':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'border-l-red-500 bg-red-500/5';
      case 'warn':
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'info':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'success':
        return 'border-l-emerald-500 bg-emerald-500/5';
      default:
        return 'border-l-slate-500 bg-slate-500/5';
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  System Logs
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportLogs}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Export logs"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={loadLogs}
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all disabled:opacity-50"
                  title="Refresh logs"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-lg ml-13">Monitor system health and error logs</p>
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500"
                />
                Auto-refresh (10s)
              </label>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {/* Level Filter */}
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>

              {/* Service Filter */}
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="">All Services</option>
                <option value="auth">Authentication</option>
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-slate-400">
                <Filter className="w-4 h-4 mr-2" />
                {filteredLogs.length} of {logs.length} logs
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading logs...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No logs found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {filteredLogs.map((log, index) => (
                      <div key={index} className={`p-4 border-l-4 ${getLogColor(log.level)} hover:bg-slate-800/20 transition-colors`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getLogIcon(log.level)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                  {log.level?.toUpperCase() || 'LOG'}
                                </span>
                                {log.service && (
                                  <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
                                    {log.service}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 mb-2">{log.message}</p>
                              {log.error && (
                                <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                                  {log.error}
                                </div>
                              )}
                              {log.metadata && (
                                <details className="text-xs text-slate-400 mt-2">
                                  <summary className="cursor-pointer hover:text-slate-300">Metadata</summary>
                                  <pre className="mt-2 p-2 bg-slate-800/50 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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


