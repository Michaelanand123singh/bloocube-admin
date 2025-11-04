"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Settings,
  Bell
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: FileText },
  { name: 'Posts', href: '/posts', icon: FileText },
  { name: 'Announcements', href: '/announcements', icon: Bell },
  { name: 'Logs', href: '/logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export default function Sidebar(){
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-slate-900/40 backdrop-blur-sm border-r border-slate-800/50 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex-1 px-4 py-6">
        <div className="mb-6 px-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Navigation
          </h2>
        </div>
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-violet-300 border border-violet-500/30 shadow-sm shadow-violet-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {active && (
                  <>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-r-full"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent rounded-xl"></div>
                  </>
                )}
                <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="relative z-10">{item.name}</span>
                {active && (
                  <div className="ml-auto relative z-10">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer section */}
        <div className="mt-8 pt-6 border-t border-slate-800/50">
          <div className="px-3">
            <div className="text-xs text-slate-500 mb-2">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400 font-medium">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}


