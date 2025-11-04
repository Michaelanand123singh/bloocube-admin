"use client";
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminConfig } from '@/lib/api';

function LoginPageInner(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState<string|null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${adminConfig.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      if (data.data?.user?.role !== 'admin') {
        throw new Error('Access denied: not an admin');
      }
      // Tokens are now in HttpOnly cookies, so we don't need to store them in localStorage
      // Just store the user data
      localStorage.setItem('user', JSON.stringify(data.data.user));
      const nextPath = (searchParams.get('next') || '/dashboard') as any;
      router.replace(nextPath);
    } catch (err:any) {
      // Optional dev fallback behind env flag
      const allowDevLogin = process.env.NEXT_PUBLIC_ALLOW_DEV_ADMIN_LOGIN === 'true';
      if (allowDevLogin) {
        try {
          if (email && password) {
            const devUser = { id: 'dev-admin', name: 'Dev Admin', email, role: 'admin' };
            // Use a minimal fake JWT-like structure to avoid decoding errors in Navbar
            const payload = btoa(JSON.stringify({ name: devUser.name, email: devUser.email, role: devUser.role }));
            const devToken = `fake.${payload}.sig`;
            localStorage.setItem('token', devToken);
            localStorage.setItem('user', JSON.stringify(devUser));
            const nextPath = (searchParams.get('next') || '/dashboard') as any;
            router.replace(nextPath);
            return;
          }
        } catch {}
      }
      setError(err.message || 'Login failed');
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo and branding */}
        <div className="relative mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/30 border border-violet-400/20">
                <span className="text-white text-2xl font-bold">B</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
            Bloocube Admin
          </h1>
          <p className="text-slate-400 text-sm font-medium">Enterprise Management Portal</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400 font-medium">Secure Access</span>
          </div>
        </div>

        {/* Login card */}
        <div className="card card-elevated p-8 animate-slide-up">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
            <p className="text-sm text-slate-400">Sign in to continue to your admin dashboard</p>
          </div>

          <form className="grid gap-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="admin@company.com" 
                type="email" 
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="••••••••" 
                type="password" 
                className="input"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-scale-in">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full py-3 text-base font-semibold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200"
            >
              Sign in to Admin
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <a className="block text-center text-sm text-slate-400 hover:text-violet-400 transition-colors font-medium cursor-pointer">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-xs text-slate-500 font-medium mb-2">
            🔒 Protected area. Authorized administrators only.
          </p>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Bloocube. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage(){
  return (
    <Suspense fallback={<main style={{display:'grid',placeItems:'center',minHeight:'100dvh'}}><div style={{color:'#9aa4b2'}}>Loading...</div></main>}>
      <LoginPageInner />
    </Suspense>
  );
}
