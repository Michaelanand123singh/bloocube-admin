"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
 const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isLoginPage = pathname === '/login';
    
    if (!userData && !isLoginPage) {
      router.push('/login');
      return;
    }
    
    if (userData) {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [pathname, router]);

  // Professional loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl animate-pulse shadow-lg shadow-violet-500/30"></div>
              <div className="absolute inset-2 bg-slate-950 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg"></div>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          <p className="mt-6 text-slate-400 text-sm font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't show navbar on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
  
 <div className="flex min-h-screen bg-slate-950 text-white relative">
      {/* 🔹 Overlay for mobile (background blur) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 🔹 Main content area */}
      <div
        className={`
          flex flex-col flex-1 transition-all duration-500 ease-in-out
          ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}
        `}
      >
        {/* 🔹 Top Navbar (desktop) */}
       <div className="hidden lg:block">
      <Navbar />
    </div>

        {/* 🔹 Mobile Header (only visible on small screens) */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Navbar />
        </div>

        {/* 🔹 Page Content */}
       <div className="p-4 lg:p-5 relative">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
      </div>
    </div>
  );
}
