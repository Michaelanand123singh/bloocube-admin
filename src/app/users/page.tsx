"use client";
import { useEffect, useState } from 'react';
import { Users, Search, Filter, RefreshCw, UserCheck, UserX, Mail, Calendar, Plus, Trash2, X, Key, Eye, EyeOff } from 'lucide-react';
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
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: 'creator' | 'brand' | 'admin' }>({ name: '', email: '', password: '', role: 'creator' });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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

  const createUser = async () => {
    try {
      setError(null);
      setCreating(true);
      await adminApi.createUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'creator' });
      setShowCreate(false);
      await loadUsers();
    } catch (e: any) {
      setError(e.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setError(null);
      await adminApi.deleteUser(id);
      await loadUsers();
    } catch (e: any) {
      setError(e.message || 'Failed to delete user');
    }
  };

  const changePassword = async () => {
    if (!passwordChangeUser) return;
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      setChangingPassword(true);
      const response = await adminApi.changeUserPassword(passwordChangeUser._id, newPassword);
      
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      setPasswordChangeUser(null);
      
      // Show success message
      setError(null);
      alert(`Password changed successfully for ${response.data.userName} (${response.data.userEmail})`);
      
    } catch (e: any) {
      setError(e.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const openPasswordChange = (user: User) => {
    setPasswordChangeUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(true);
    setError(null);
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








  // Pagination state
const [currentPage, setCurrentPage] = useState(1);
const usersPerPage = 9;

// Pagination calculations
const indexOfLastUser = currentPage * usersPerPage;
const indexOfFirstUser = indexOfLastUser - usersPerPage;
const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

// Handlers
const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};


  return (
    <Layout>
    <main className="min-h-screen  p-3 sm:p-6 md:p-10">
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-md flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-2xl font-bold  ">
            User Management
          </h1>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all disabled:opacity-50 self-start sm:self-auto"
          title="Refresh users"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="text-slate-400 text-base sm:text-lg">
        Manage user accounts and permissions
      </p>
    </div>

    {/* Error */}
    {error && (
      <div className="bg-red-950/50 border border-red-500/50 rounded-md p-3 sm:p-4 mb-6 backdrop-blur-sm">
        <p className="text-red-300 text-sm sm:text-base">{error}</p>
      </div>
    )}

    {/* Filters */}
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-md p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Create User */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 rounded-md text-white flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>

        {/* Search */}
        <div className="relative col-span-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 text-sm sm:text-base"
          />
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-md text-white focus:outline-none focus:border-violet-500/50 text-sm sm:text-base"
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
          className="px-3 py-3 bg-slate-800/50 border border-slate-700/50 rounded-md text-white focus:outline-none focus:border-violet-500/50 text-sm sm:text-base"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Result Count */}
        <div className="flex items-center justify-center lg:justify-end text-slate-400 text-sm sm:text-base">
          <Filter className="w-4 h-4 mr-2" />
          {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>

    {/* User Cards */}
  <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {currentUsers.length > 0 ? (
    currentUsers.map((user) => (
      <div
        key={user._id}
        className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 hover:bg-slate-800/50 transition-all cursor-pointer shadow-md hover:shadow-lg"
        onClick={() => setSelectedUser(user)}
      >
        {/* Header */}
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">
              {user.name}
            </h3>
            <div className="text-xs sm:text-sm text-slate-400 flex items-center truncate">
              <Mail className="w-4 h-4 mr-1 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`inline-flex px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
              user.role === "admin"
                ? "bg-red-500/20 text-red-300"
                : user.role === "creator"
                ? "bg-blue-500/20 text-blue-300"
                : user.role === "brand"
                ? "bg-purple-500/20 text-purple-300"
                : "bg-slate-500/20 text-slate-300"
            }`}
          >
            {user.role}
          </span>

          <span
            className={`inline-flex items-center px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
              user.isActive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {user.isActive ? (
              <>
                <UserCheck className="w-3 h-3 mr-1" /> Active
              </>
            ) : (
              <>
                <UserX className="w-3 h-3 mr-1" /> Inactive
              </>
            )}
          </span>
        </div>

        {/* Joined Date */}
        <div className="text-[11px] sm:text-sm text-slate-400 flex items-center mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </div>

        {/* Actions */}
        <div
          className="flex flex-wrap gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => toggleUser(user._id)}
            className={`flex-1 px-2 py-2 text-[11px] sm:text-xs font-medium rounded-lg transition-all ${
              user.isActive
                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
            }`}
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => openPasswordChange(user)}
            className="flex-1 px-2 py-2 text-[11px] sm:text-xs font-medium rounded-lg transition-all bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center gap-1"
            title="Change password"
          >
            <Key className="w-3 h-3" /> Password
          </button>

          <button
            onClick={() => deleteUser(user._id)}
            className="flex-1 px-2 py-2 text-[11px] sm:text-xs font-medium rounded-lg transition-all bg-slate-700/20 text-slate-300 hover:bg-slate-700/30 border border-slate-600/30 flex items-center justify-center gap-1"
            title="Delete user"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full text-center p-8 text-slate-400">
      <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      No users found
    </div>
  )}
</div>


    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex flex-wrap justify-center items-center mt-8 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-2 rounded-lg transition-all ${
              currentPage === index + 1
                ? "bg-violet-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
</main>

  {/* User Details Modal */}
 {selectedUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-2">
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => setSelectedUser(null)}
    />

    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl 
      p-4 sm:p-6 w-[95%] sm:w-full max-w-lg sm:max-w-2xl lg:max-w-3xl 
      max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{selectedUser.name}</h2>
            <div className="text-slate-400 text-sm break-all">{selectedUser.email}</div>
          </div>
        </div>

        <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-2">Account</div>
          <div className="text-sm text-slate-300">
            Role: <span className="text-white font-medium">{selectedUser.role}</span>
          </div>
          <div className="text-sm text-slate-300">
            Status:{" "}
            <span className={`font-medium ${selectedUser.isActive ? "text-emerald-400" : "text-red-400"}`}>
              {selectedUser.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="text-sm text-slate-300">
            Joined: <span className="text-white font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</span>
          </div>
          {selectedUser.lastLogin && (
            <div className="text-sm text-slate-300">
              Last Login: <span className="text-white font-medium">{new Date(selectedUser.lastLogin).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-2">Profile</div>
          <div className="text-sm text-slate-300">
            Bio: <span className="text-white font-medium break-all">{(selectedUser as any).profile?.bio || "—"}</span>
          </div>
          <div className="text-sm text-slate-300 break-all">
            Avatar URL:{" "}
            <span className="text-white font-medium">{(selectedUser as any).profile?.avatar_url || "—"}</span>
          </div>
        </div>

        {/* Social Accounts */}
        <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-2">Connected Social Accounts</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {["youtube", "twitter", "instagram", "facebook", "linkedin"].map((p) => {
              const acc = (selectedUser as any).socialAccounts?.[p];
              const connected = Boolean(acc?.connectedAt || acc?.id);

              return (
                <div key={p} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1 uppercase">{p}</div>
                  <div className={`font-medium ${connected ? "text-emerald-400" : "text-slate-500"}`}>
                    {connected ? "Connected" : "Not connected"}
                  </div>
                  {connected && (
                    <div className="text-slate-400 text-xs mt-1">
                      Since: {acc.connectedAt ? new Date(acc.connectedAt).toLocaleDateString() : "—"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setSelectedUser(null)}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      {/* Create User Modal */}
     {showCreate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => !creating && setShowCreate(false)}
    />

    {/* Modal Box */}
    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Create New User</h2>
        <button
          onClick={() => !creating && setShowCreate(false)}
          className="p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-3">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg 
                     text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
        />

        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg 
                     text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
        />

        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg 
                     text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
        />

        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white 
                     focus:outline-none focus:border-violet-500/50"
        >
          <option value="creator">Creator</option>
          <option value="brand">Brand</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-4">
        <button
          onClick={() => setShowCreate(false)}
          disabled={creating}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 
                     w-full sm:w-auto"
        >
          Cancel
        </button>

        <button
          onClick={createUser}
          disabled={creating || !newUser.name || !newUser.email || !newUser.password}
          className="px-4 py-2 rounded-lg bg-violet-600 text-white disabled:opacity-50 
                     w-full sm:w-auto"
        >
          {creating ? "Creating..." : "Create User"}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Password Change Modal */}
      {showPasswordChange && passwordChangeUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => !changingPassword && setShowPasswordChange(false)}
    />

    {/* Modal Box */}
    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 
                    w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full 
                          flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white truncate">
              Change Password
            </h2>
            <div className="text-slate-400 text-xs sm:text-sm truncate">
              {passwordChangeUser.name} ({passwordChangeUser.email})
            </div>
          </div>
        </div>

        <button
          onClick={() => !changingPassword && setShowPasswordChange(false)}
          className="p-2 text-slate-400 hover:text-white"
          disabled={changingPassword}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">

        {/* NEW PASSWORD */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            New Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-2 pr-10 bg-slate-800/50 border border-slate-700/50 
                         rounded-lg text-white placeholder-slate-400
                         focus:outline-none focus:border-blue-500/50"
              disabled={changingPassword}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              disabled={changingPassword}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Confirm Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg 
                       text-white placeholder-slate-400 
                       focus:outline-none focus:border-blue-500/50"
            disabled={changingPassword}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 pt-2">

          <button
            onClick={() => setShowPasswordChange(false)}
            disabled={changingPassword}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 
                       hover:bg-slate-800 disabled:opacity-50 w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={changePassword}
            disabled={
              changingPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                       disabled:opacity-50 flex items-center justify-center gap-2 
                       w-full sm:w-auto"
          >
            {changingPassword ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Changing...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Change Password
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  </div>
)}

    </Layout>
  )
}


