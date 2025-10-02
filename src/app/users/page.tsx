"use client";
import { useEffect, useState } from 'react';
import { Users, Search, Filter, RefreshCw, UserCheck, UserX, Mail, Calendar } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Layout from '@/components/layout/Layout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersPage(){
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminApi.listUsers();
      setUsers(response.data.users);
    } catch (e: any) {
      setError(e.message || 'Failed to load users');
      console.error('Users fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleUser = async (id: string) => {
    try {
      await adminApi.toggleUser(id);
      await loadUsers(); // Refresh the list
    } catch (e: any) {
      setError(e.message || 'Failed to toggle user status');
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  User Management
                </h1>
              </div>
              <button
                onClick={loadUsers}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all disabled:opacity-50"
                title="Refresh users"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-slate-400 text-lg ml-13">Manage user accounts and permissions</p>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="creator">Creator</option>
                <option value="brand">Brand</option>
                <option value="admin">Admin</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-slate-400">
                <Filter className="w-4 h-4 mr-2" />
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mr-4">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-slate-400 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                            user.role === 'creator' ? 'bg-blue-500/20 text-blue-300' :
                            user.role === 'brand' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUser(user._id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                              user.isActive
                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredUsers.length === 0 && !loading && (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No users found</p>
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


