"use client";
import { useEffect, useState } from 'react';
import { Users, Target, Gavel, BarChart3, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

export default function DashboardPage(){
  const [stats, setStats] = useState<{users:number;campaigns:number;bids:number;analytics:number}|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await adminApi.getStats();
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message || 'Failed to fetch dashboard stats');
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <button
                  onClick={fetchStats}
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-lg ml-13">Monitor your platform metrics in real-time</p>
          </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 rounded-2xl p-6 h-40 animate-pulse" />
            ))}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={stats.users}
              icon={<Users className="w-6 h-6" />}
              gradient="from-blue-500 to-cyan-500"
              delay={0}
            />
            <StatCard 
              title="Active Campaigns" 
              value={stats.campaigns}
              icon={<Target className="w-6 h-6" />}
              gradient="from-violet-500 to-purple-500"
              delay={100}
            />
            <StatCard 
              title="Total Bids" 
              value={stats.bids}
              icon={<Gavel className="w-6 h-6" />}
              gradient="from-amber-500 to-orange-500"
              delay={200}
            />
            <StatCard 
              title="Analytics Events" 
              value={stats.analytics}
              icon={<BarChart3 className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-500"
              delay={300}
            />
          </div>
        )}

        {/* Additional Info */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="Avg. Campaign Size"
              value={Math.round(stats.bids / stats.campaigns)}
              suffix=" bids"
            />
            <MetricCard 
              label="User Engagement"
              value={Math.round((stats.analytics / stats.users) * 10) / 10}
              suffix=" events/user"
            />
            <MetricCard 
              label="Platform Activity"
              value="High"
              trend="+12.5%"
            />
          </div>
        )}
        </div>
      </main>
    </Layout>
  )
}

function StatCard({title, value, icon, gradient, delay}:{
  title:string;
  value:number;
  icon:React.ReactNode;
  gradient:string;
  delay:number;
}){
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{transitionDelay: `${delay}ms`}}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
      
      {/* Icon Badge */}
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
          {title}
          <TrendingUp className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-4xl font-bold text-white mb-1 tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-3">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
            style={{width: isVisible ? '100%' : '0%'}}
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({label, value, suffix, trend}:{
  label:string;
  value:string|number;
  suffix?:string;
  trend?:string;
}){
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 hover:border-slate-700/50 transition-all">
      <div className="text-slate-500 text-sm mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-200">
          {value}{suffix}
        </div>
        {trend && (
          <span className="text-emerald-400 text-sm font-medium">{trend}</span>
        )}
      </div>
    </div>
  )
}