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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <p className="text-slate-400">Loading...</p>
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
