"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <div className="relative flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
