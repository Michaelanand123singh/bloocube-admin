"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Settings,
  Bell,ChevronLeft,ChevronRight,Menu,X
} from 'lucide-react';

import Logo from '../../assets/Logo.png'
import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LogoutModal from './LogoutModel';
import { useState } from 'react';
type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};


interface SidebarProps {
  onClose?: () => void; // optional (since desktop may not pass it)
}
const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: FileText },
  { name: 'Posts', href: '/posts', icon: FileText },
  { name: 'Announcements', href: '/announcements', icon: Bell },
  { name: 'Logs', href: '/logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings }
];

interface SidebarProps {
  sidebarOpen: boolean;
   setSidebarOpen: (value: boolean) => void;
}

// Accept the 'sidebarOpen' prop
const Sidebar = React.memo(({ sidebarOpen,setSidebarOpen }: SidebarProps) => { 
  const [user, setUser] = useState<{ name?: string, email?: string, avatar_url?: string } | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  // useEffect(() => {
  //   const userData = cookieAuthUtils.getUser();
  //   setUser(userData as { name?: string, email?: string, avatar_url?: string } | null);
  // }, []);

  const isItemActive = useCallback((item: typeof navItems[0]) => {
    const normalizedPathname = pathname.replace(/\/$/, '').split('?')[0];
    const normalizedHref = item.href.replace(/\/$/, '');
    
    if (normalizedHref === '/creator') {
      return normalizedPathname === '/creator';
    }
    
    return normalizedPathname.startsWith(normalizedHref);
  }, [pathname]);

 
 const [openLogoutModal, setOpenLogoutModal] = useState(false);
 const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const handleOpenLogoutModal = () => {
     setOpenLogoutModal(true);
    };
  
   const onLogout = useCallback(() => {
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

    
  const getNavItemClasses = (item: typeof navItems[0], isActive: boolean) => {
    const baseClasses = "group relative flex items-center px-4 py-3.5 text-sm font-semibold rounded-md transition-all duration-500 ease-out transform hover:scale-[1.02] hover:shadow-lg";
    const activeClasses = `bg-gradient-to-r from-blue-600 to-purple-600 text-white  shadow-sm  before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`;
    const inactiveClasses = "text-white-200 hover:bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:text-white/80 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-gray-200/50";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const getIconClasses = (item: typeof navItems[0], isActive: boolean) => {
    const baseClasses = "w-5 h-5 transition-all duration-500 ease-out";
    const activeClasses = "text-white drop-shadow-sm";
    const inactiveClasses = `text-white-500 group-hover:text-white-600 group-hover:scale-110`;
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

//   useEffect(() => {
//   if (window.innerWidth < 1024) {
//     // Auto close only on mobile when a link is clicked
//     setSidebarOpen(true);
//   }
// }, [pathname]);

  return (
    // This className controls the mobile slide-in and fixed width
    <>
     <aside 
  className={`${sidebarOpen ? 'lg:w-64' : 'lg:w-20'} 
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
  bg-slate-950
  lg:translate-x-0 fixed left-0 top-0 z-[9999] w-64 sm:w-72 md:w-80 h-screen
  backdrop-blur-2xl shadow-2xl border-r border-gray-100/30 flex flex-col
  transition-all duration-500 ease-out`}
>

        <div className="flex p-3 lg:p-0 items-center justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

          {/* Logo */}
           <Link href ="/"> 
    <div className="flex items-center gap-2  pl-4">
      <img
        src={Logo.src}
        alt="Bloocube Logo"
        className="w-16 h-16 lg:w-16 lg:h-16 object-contain"
      />
            </div>
            </Link>

    {/* Close button - only mobile */}
    <button
      onClick={() => setSidebarOpen(false)}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition"
    >
      ✕
    </button>
        </div>
        
{/* Toggle Button (Desktop only) */}
<div 
  className={`hidden lg:flex  item-center transition-all duration-300 
    ${sidebarOpen 
      ? "absolute top-6 right-3"  // ✅ expanded → near logo
      : "flex justify-center mt-4" // ✅ collapsed → below logo
    }`}
>
  <button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="p-2 rounded-lg  transition"
  >
    {sidebarOpen ? (
      <ChevronLeft className="w-5 h-5 text-gray-600" />
    ) : (
      <ChevronRight className="w-5 h-5 text-gray-600" />
    )}
  </button>
</div>


      {/* Navigation */}
<nav className="flex-1 py-1 px-2 lg:py-4 sm:px-4 mt-3 sm:mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
        <div className="space-y-2 md:space-y-3 sm:space-y-3">
          {navItems.map(item => {
            const isActive = isItemActive(item);
            return (
              <Link 
                key={item.name} 
                href={item.href as any} 
                className={getNavItemClasses(item, isActive)}
              >
                <div className="relative">
                  <item.icon className={getIconClasses(item, isActive)} />
                  {isActive && (
                    <div className="absolute bg-gradient-to-r from-blue-600 to-purple-600 bg-white/20 rounded-md "></div>
                  )}
                </div>
                <span className="ml-3 md:ml-4 font-medium truncate">{item.name}</span>
                
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
     
    </aside>
    {openLogoutModal && (
  <LogoutModal 
    open={openLogoutModal}
    onOpenChange={setOpenLogoutModal}
    onConfirm={onLogout}
  />
)}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;


