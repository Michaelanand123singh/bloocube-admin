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

  // Campaigns (placeholder for posts)
  listCampaigns: () => apiRequest<{ success: boolean; data: { campaigns: any[] } }>(`/api/admin/campaigns`),

  // Logs
  getLogs: () => apiRequest<{ success: boolean; data: any }>(`/api/admin/logs`),

  // Settings
  getSettings: () => apiRequest<{ success: boolean; data: any }>(`/api/admin/settings`),
  saveSettings: (data: any) => apiRequest<{ success: boolean; data: any }>(`/api/admin/settings`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
};



