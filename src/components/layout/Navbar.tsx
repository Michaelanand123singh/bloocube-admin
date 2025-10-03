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
  User
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserData {
  name: string;
  email: string;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Posts', href: '/posts', icon: FileText },
  { name: 'Logs', href: '/logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    router.push('/login');
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
            <button 
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

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