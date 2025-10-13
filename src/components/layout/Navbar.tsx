"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Check,
  Trash2,
  MoreVertical,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

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

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: FileText },
  { name: 'Posts', href: '/posts', icon: FileText },
  { name: 'Logs', href: '/logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser environment before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // More robust JWT decoding with error handling
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ 
            name: payload.name || 'Admin', 
            email: payload.email || 'admin@bloocube.com' 
          });
        } catch (e) {
          console.error('Error decoding token:', e);
          // Set default user if token is invalid
          setUser({ name: 'Admin', email: 'admin@bloocube.com' });
        }
      } else {
        // Set default user if no token exists
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    router.push('/login');
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
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-white">Bloocube Admin</span>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href as any} // Fix: Type assertion to resolve the type conflict
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
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

                  <div className="max-h-96 overflow-y-auto">
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
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-white">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-slate-400">
                  {user?.email || 'admin@bloocube.com'}
                </div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-800/50 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href as any} // Fix: Type assertion to resolve the type conflict
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}