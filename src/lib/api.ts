export const adminConfig = {
  apiUrl: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5000',
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${adminConfig.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const adminApi = {
  // Admin dashboard
  getStats: () => apiRequest<{ success: boolean; data: { users: number; campaigns: number; bids: number; analytics: number } }>(
    '/api/admin/dashboard'
  ),

  // Users
  listUsers: (params?: { role?: string; active?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.role) search.set('role', params.role);
    if (params?.active !== undefined) search.set('active', String(params.active));
    const qs = search.toString();
    return apiRequest<{ success: boolean; data: { users: any[] } }>(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },
  toggleUser: (id: string) => apiRequest<{ success: boolean; data: { user: any } }>(`/api/admin/users/${id}/toggle`, { method: 'PATCH' }),
  createUser: (payload: { name: string; email: string; password: string; role: 'creator'|'brand'|'admin' }) =>
    apiRequest<{ success: boolean; data: { user: any } }>(`/api/admin/users`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteUser: (id: string) => apiRequest<{ success: boolean; data: { id: string } }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  changeUserPassword: (id: string, newPassword: string) => 
    apiRequest<{ success: boolean; message: string; data: { userId: string; userEmail: string; userName: string; changedBy: string; changedAt: string } }>(`/api/admin/users/${id}/password`, { 
      method: 'PUT', 
      body: JSON.stringify({ newPassword }) 
    }),
  getUserPosts: (userId: string, params?: { page?: number; limit?: number; status?: string; platform?: string; search?: string; sort?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.status) search.set('status', params.status);
    if (params?.platform) search.set('platform', params.platform);
    if (params?.search) search.set('search', params.search);
    if (params?.sort) search.set('sort', params.sort);
    const qs = search.toString();
    return apiRequest<{ success: boolean; data: { user: any; posts: any[]; pagination: { page: number; limit: number; total: number; pages: number } } }>(`/api/admin/users/${userId}/posts${qs ? `?${qs}` : ''}`);
  },

  // Campaigns (placeholder for posts)
  listCampaigns: () => apiRequest<{ success: boolean; data: { campaigns: any[] } }>(`/api/admin/campaigns`),
  getCampaignBids: (id: string, params?: { page?: number; limit?: number; status?: string; sort?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.status) search.set('status', params.status);
    if (params?.sort) search.set('sort', params.sort);
    const qs = search.toString();
    return apiRequest<{ success: boolean; data: { bids: any[]; pagination: { page: number; limit: number; total: number; pages: number } } }>(`/api/campaigns/${id}/bids${qs ? `?${qs}` : ''}`);
  },
  acceptBid: (campaignId: string, bidId: string) =>
    apiRequest<{ success: boolean; data: { bid: any } }>(`/api/campaigns/${campaignId}/bids/${bidId}/accept`, { method: 'POST' }),
  rejectBid: (campaignId: string, bidId: string) =>
    apiRequest<{ success: boolean; data: { bid: any } }>(`/api/campaigns/${campaignId}/bids/${bidId}/reject`, { method: 'POST' }),
  // Posts (admin can fetch all via /api/posts with query)
  listPosts: (params?: { page?: number; limit?: number; status?: string; platform?: string; search?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.status) search.set('status', params.status);
    if (params?.platform) search.set('platform', params.platform);
    if (params?.search) search.set('search', params.search);
    const qs = search.toString();
    return apiRequest<{ success: boolean; posts: any[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/posts${qs ? `?${qs}` : ''}`);
  },
  getPost: (id: string) =>
    apiRequest<{ success: boolean; post: any }>(`/api/posts/${id}`),
  getCampaignAnalytics: (id: string) =>
    apiRequest<{ success: boolean; data: { campaign: any; analytics: any; posts: any[] } }>(`/api/campaigns/${id}/analytics`),

  // Logs
  getLogs: (limit: number = 50, opts?: { level?: string; service?: string }) => {
    const search = new URLSearchParams();
    search.set('limit', String(limit));
    if (opts?.level) search.set('level', opts.level);
    if (opts?.service) search.set('service', opts.service);
    const qs = search.toString();
    return apiRequest<{ success: boolean; data: any[] }>(`/api/admin/logs?${qs}`);
  },

  // Settings
  getSettings: () => apiRequest<{ success: boolean; data: any }>(`/api/admin/settings`),
  saveSettings: (data: any) => apiRequest<{ success: boolean; data: any }>(`/api/admin/settings`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Analytics
  getTopPosts: (limit: number = 10, period?: 'last_7_days'|'last_30_days'|'last_90_days') => {
    const search = new URLSearchParams();
    search.set('limit', String(limit));
    if (period) search.set('period', period);
    const qs = search.toString();
    return apiRequest<{ success: boolean; data: { posts: any[] } }>(`/api/analytics/top${qs ? `?${qs}` : ''}`);
  },
  getPlatformStats: (platform: string, period?: 'last_7_days'|'last_30_days'|'last_90_days') => {
    const qs = period ? `?period=${encodeURIComponent(period)}` : '';
    return apiRequest<{ success: boolean; data: { stats: any } }>(`/api/analytics/platform/${platform}${qs}`);
  },
  getUserAnalytics: (userId: string, platform?: string) => {
    const qs = platform ? `?platform=${encodeURIComponent(platform)}` : '';
    return apiRequest<{ success: boolean; data: { analytics: any[] } }>(`/api/analytics/user/${userId}${qs}`);
  },

  // Dashboard analytics aggregations
  getPostsTimeSeries: (period?: 'last_7_days'|'last_30_days'|'last_90_days') => {
    const qs = period ? `?period=${encodeURIComponent(period)}` : '';
    return apiRequest<{ success: boolean; data: { series: Array<{ label:string; value:number }> } }>(`/api/analytics/timeseries/posts${qs}`);
  },
  getSuccessFailure: (period?: 'last_7_days'|'last_30_days'|'last_90_days') => {
    const qs = period ? `?period=${encodeURIComponent(period)}` : '';
    return apiRequest<{ success: boolean; data: { bars: Array<{ label:string; success:number; failed:number }> } }>(`/api/analytics/success-failure${qs}`);
  },

  // AI Providers (admin)
  getAIProvidersStatus: () =>
    apiRequest<{ success: boolean; data: any }>(`/api/admin/ai-providers/status`),
  getAIProvidersHealth: () =>
    apiRequest<{ success: boolean; data: any }>(`/api/admin/ai-providers/health`),
  getAIAvailableModels: (provider?: string) => {
    const qs = provider ? `?provider=${encodeURIComponent(provider)}` : '';
    return apiRequest<{ success: boolean; data: any }>(`/api/admin/ai-providers/models${qs}`);
  },
  getAIProviderLogs: (params?: { provider?: string; limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.provider) search.set('provider', params.provider);
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return apiRequest<{ success: boolean; data: any }>(`/api/admin/ai-providers/logs${qs ? `?${qs}` : ''}`);
  },
  switchAIProvider: (payload: { provider: 'openai'|'gemini'; model?: string }) =>
    apiRequest<{ success: boolean; data: any }>(`/api/admin/ai-providers/switch`, { method: 'POST', body: JSON.stringify(payload) }),
  updateAIProviderConfig: (config: any) =>
    apiRequest<{ success: boolean; data: any }>(`/api/admin/ai-providers/config`, { method: 'PUT', body: JSON.stringify(config) }),

  // Notifications
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: string; priority?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.unreadOnly !== undefined) search.set('unreadOnly', String(params.unreadOnly));
    if (params?.type) search.set('type', params.type);
    if (params?.priority) search.set('priority', params.priority);
    const qs = search.toString();
    return apiRequest<{ success: boolean; data: { notifications: any[]; pagination: any; unreadCount: number } }>(`/api/notifications${qs ? `?${qs}` : ''}`);
  },
  getUnreadCount: () =>
    apiRequest<{ success: boolean; data: { unreadCount: number } }>(`/api/notifications/unread-count`),
  markAsRead: (id: string) =>
    apiRequest<{ success: boolean; data: { notification: any } }>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () =>
    apiRequest<{ success: boolean; data: { modifiedCount: number } }>(`/api/notifications/mark-all-read`, { method: 'PATCH' }),
  deleteNotification: (id: string) =>
    apiRequest<{ success: boolean; data: { id: string } }>(`/api/notifications/${id}`, { method: 'DELETE' }),
  createNotification: (payload: { title: string; message: string; type: string; recipient: string; priority?: string; data?: any; relatedResource?: any; actions?: any[]; expiresAt?: string }) =>
    apiRequest<{ success: boolean; data: { notification: any } }>(`/api/notifications`, { method: 'POST', body: JSON.stringify(payload) }),
  getNotificationStats: () =>
    apiRequest<{ success: boolean; data: any }>(`/api/notifications/stats`),

  // Announcements
  getAnnouncements: (params?: { page?: number; limit?: number; priority?: string; targetRole?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.targetRole) searchParams.append('targetRole', params.targetRole);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return apiRequest<{ success: boolean; data: { announcements: any[]; total: number; page: number; limit: number; totalPages: number } }>(`/api/notifications/announcements${queryString ? `?${queryString}` : ''}`);
  },
  createAnnouncement: (payload: { title: string; message: string; targetRoles?: string[]; priority?: string; data?: any; actions?: any[]; expiresAt?: string; sendEmail?: boolean }) =>
    apiRequest<{ success: boolean; message: string; data: { notificationsCreated: number; emailsQueued: number; targetUserCount: number; targetRoles: string[]; announcement: any } }>(`/api/notifications/announcement`, { method: 'POST', body: JSON.stringify(payload) }),
  getAnnouncementStats: () =>
    apiRequest<{ success: boolean; data: any }>(`/api/notifications/announcement-stats`),
  getEmailQueueStats: () =>
    apiRequest<{ success: boolean; data: any }>(`/api/notifications/email-queue-stats`),
  getComprehensiveStats: () =>
    apiRequest<{ success: boolean; data: { announcements: any; emails: any; summary: any } }>(`/api/notifications/comprehensive-stats`)
};



