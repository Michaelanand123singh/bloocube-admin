"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity,
  LogOut,
  Bell,
  User,
  Check,
  Trash2,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { adminApi, adminConfig } from '@/lib/api';

interface UserData {
  name: string;
  email: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
  data?: any;
  relatedResource?: {
    type: string;
    id: string;
  };
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
    style: string;
  }>;
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser environment before accessing localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUser({ 
            name: user.name || 'Admin', 
            email: user.email || 'admin@bloocube.com' 
          });
        } catch (e) {
          console.error('Error parsing user data:', e);
          // Set default user if user data is invalid
          setUser({ name: 'Admin', email: 'admin@bloocube.com' });
        }
      } else {
        // Set default user if no user data exists
        setUser({ name: 'Admin', email: 'admin@bloocube.com' });
      }
    }
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    loadUnreadCount();
    // Set up polling for unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load full notifications when dropdown is opened
  useEffect(() => {
    if (showNotifications) {
      loadNotifications();
    }
  }, [showNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && !(event.target as Element).closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch(`${adminConfig.apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      router.push('/login');
    }
  };

  // Notification functions
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await adminApi.getNotifications({ limit: 10 });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await adminApi.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await adminApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await adminApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-500/5';
      case 'high':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'medium':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'low':
        return 'border-l-green-500 bg-green-500/5';
      default:
        return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 shadow-lg shadow-black/10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Bloocube Admin
                </span>
                <span className="ml-2 text-xs text-slate-500 font-medium">Enterprise</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-700/50 focus-visible-ring"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown absolute mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 right-4 left-4 md:left-auto md:right-0 w-auto md:w-80 max-w-[calc(100vw-2rem)] md:max-w-none">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[75vh] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-slate-400 text-sm">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-700">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 hover:bg-slate-800/50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                              !notification.isRead ? 'bg-slate-800/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getPriorityIcon(notification.priority)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-xs text-slate-500">
                                        {notification.timeAgo}
                                      </span>
                                      <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                                        {notification.type.replace('_', ' ')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    {!notification.isRead && (
                                      <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                                        title="Mark as read"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification._id)}
                                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                      title="Delete notification"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Action buttons */}
                                {notification.actions && notification.actions.length > 0 && (
                                  <div className="flex gap-2 mt-3">
                                    {notification.actions.map((action, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          if (action.url) {
                                            window.open(action.url, '_blank');
                                          }
                                        }}
                                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                          action.style === 'primary' ? 'bg-violet-600 text-white hover:bg-violet-700' :
                                          action.style === 'secondary' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' :
                                          action.style === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                                          action.style === 'warning' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                                          action.style === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                                          'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                      >
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-700">
                      <button
                        onClick={() => {
                          // Navigate to full notifications page if it exists
                          router.push('/notifications' as any);
                        }}
                        className="w-full text-center text-sm text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800/50">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-white">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {user?.email || 'admin@bloocube.com'}
                </div>
              </div>
              <div className="relative group">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border-2 border-slate-700/50 group-hover:border-slate-600 transition-colors shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20 focus-visible-ring"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}